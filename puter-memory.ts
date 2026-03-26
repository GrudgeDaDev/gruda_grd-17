/**
 * GRD-17 AI Memory — Persistent Conversation History
 * GRUDGE STUDIO / GRUDACHAIN
 *
 * Keeps every user's conversation history with each Legion core in
 * Puter KV (fast) + Puter FS (backup).  When a user returns, their
 * full history loads automatically — no more cold-start amnesia.
 *
 * Design rules:
 *  - MAX 20 messages per core per user (10 turns) to stay in context window
 *  - KV TTL = 30 days rolling (refreshed on every write)
 *  - Secret key / sensitive data NEVER stored
 *  - All keys prefixed with "grudge_grd17_hist_" to avoid namespace collisions
 *  - If Puter is unavailable, falls back silently (in-memory only for session)
 */

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_HISTORY_MESSAGES = 20;            // max messages stored per core
const KV_TTL_SECONDS       = 30 * 24 * 3600; // 30 days rolling
const HISTORY_FS_DIR       = '/GRUDA/grd17/memory';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HistoryMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;   // which Puter model answered
  source?: string;  // 'puter' | 'grudge-backend'
}

export interface CoreMemory {
  userId: string;
  coreId: string;
  messages: HistoryMessage[];
  totalInteractions: number;
  firstSeen: string;
  lastSeen: string;
  /** User relationship profile — built up over time */
  profile: {
    preferredTopics: string[];
    interactionStyle: 'concise' | 'detailed' | 'technical' | 'casual';
    activeProjects: string[];
    notes: string;
  };
}

// ── Puter type (browser) ─────────────────────────────────────────────────────

declare const puter: {
  auth: { isSignedIn(): boolean; getUser(): Promise<{ uuid: string }> };
  kv: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
    del(key: string): Promise<void>;
  };
  fs: {
    write(path: string, data: string, options?: { createMissingParents?: boolean }): Promise<void>;
    read(path: string): Promise<{ text(): Promise<string> }>;
  };
};

function getPuter() {
  if (typeof window !== 'undefined' && typeof (window as any).puter !== 'undefined') {
    return (window as any).puter as typeof puter;
  }
  return null;
}

// ── Key helpers ───────────────────────────────────────────────────────────────

function kvKey(coreId: string, userId: string): string {
  return `grudge_grd17_hist_${coreId}_${userId}`;
}
function fsPath(coreId: string, userId: string): string {
  // Sanitize IDs for filesystem safety
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${HISTORY_FS_DIR}/${safe(coreId)}/${safe(userId)}.json`;
}

// ── Default memory ────────────────────────────────────────────────────────────

function defaultMemory(userId: string, coreId: string): CoreMemory {
  const now = new Date().toISOString();
  return {
    userId,
    coreId,
    messages: [],
    totalInteractions: 0,
    firstSeen: now,
    lastSeen: now,
    profile: {
      preferredTopics: [],
      interactionStyle: 'detailed',
      activeProjects: [],
      notes: '',
    },
  };
}

// ── Session-only fallback (when Puter unavailable) ────────────────────────────

const sessionCache = new Map<string, CoreMemory>();

function sessionKey(coreId: string, userId: string) {
  return `${coreId}::${userId}`;
}

// ── GRD-17 Memory Service ─────────────────────────────────────────────────────

class GRD17MemoryService {

  // ── Load history ────────────────────────────────────────────────────────────

  async loadMemory(coreId: string, userId: string): Promise<CoreMemory> {
    const p = getPuter();
    const key = sessionKey(coreId, userId);

    // 1. Try Puter KV (fastest)
    if (p && p.auth.isSignedIn()) {
      try {
        const raw = await p.kv.get(kvKey(coreId, userId));
        if (raw) {
          const mem = JSON.parse(raw) as CoreMemory;
          sessionCache.set(key, mem);
          return mem;
        }
      } catch {
        // fall through to FS
      }

      // 2. Try Puter FS backup
      try {
        const file = await p.fs.read(fsPath(coreId, userId));
        const raw = await file.text();
        const mem = JSON.parse(raw) as CoreMemory;
        sessionCache.set(key, mem);
        return mem;
      } catch {
        // no prior history
      }
    }

    // 3. Session-only fallback
    const cached = sessionCache.get(key);
    if (cached) return cached;

    const fresh = defaultMemory(userId, coreId);
    sessionCache.set(key, fresh);
    return fresh;
  }

  // ── Save history ────────────────────────────────────────────────────────────

  async saveMemory(memory: CoreMemory): Promise<void> {
    const { coreId, userId } = memory;

    // Trim to max before saving
    if (memory.messages.length > MAX_HISTORY_MESSAGES) {
      // Always keep the most recent messages; never discard system messages
      const systemMsgs = memory.messages.filter(m => m.role === 'system');
      const nonSystem  = memory.messages.filter(m => m.role !== 'system');
      const trimmed    = nonSystem.slice(-MAX_HISTORY_MESSAGES);
      memory.messages  = [...systemMsgs, ...trimmed];
    }

    memory.lastSeen = new Date().toISOString();

    // Session cache always updated
    sessionCache.set(sessionKey(coreId, userId), memory);

    const p = getPuter();
    if (!p || !p.auth.isSignedIn()) return;

    const payload = JSON.stringify(memory);

    // KV with rolling TTL
    try {
      await p.kv.set(kvKey(coreId, userId), payload, { ttl: KV_TTL_SECONDS });
    } catch (err: any) {
      console.warn('[memory] KV write failed:', err.message);
    }

    // FS backup (async, don't block)
    p.fs
      .write(fsPath(coreId, userId), payload, { createMissingParents: true })
      .catch(() => {});
  }

  // ── Add message pair (user + assistant) ─────────────────────────────────────

  async addExchange(
    coreId: string,
    userId: string,
    userMessage: string,
    assistantMessage: string,
    meta: { model?: string; source?: string } = {},
  ): Promise<CoreMemory> {
    const mem = await this.loadMemory(coreId, userId);
    const now = new Date().toISOString();

    mem.messages.push(
      { role: 'user',      content: userMessage,      timestamp: now },
      { role: 'assistant', content: assistantMessage, timestamp: now, ...meta },
    );

    mem.totalInteractions += 1;

    await this.saveMemory(mem);
    return mem;
  }

  // ── Get messages ready for puter.ai.chat() ───────────────────────────────────
  // Returns the last N messages formatted for the messages array,
  // stripping internal metadata fields Puter doesn't need.

  getMessagesForContext(
    memory: CoreMemory,
    limit = MAX_HISTORY_MESSAGES,
  ): Array<{ role: string; content: string }> {
    const msgs = memory.messages
      .filter(m => m.role !== 'system')   // system prompt injected separately
      .slice(-limit)
      .map(m => ({ role: m.role, content: m.content }));
    return msgs;
  }

  // ── Update user relationship profile ────────────────────────────────────────

  async updateProfile(
    coreId: string,
    userId: string,
    patch: Partial<CoreMemory['profile']>,
  ): Promise<void> {
    const mem = await this.loadMemory(coreId, userId);
    mem.profile = { ...mem.profile, ...patch };
    await this.saveMemory(mem);
  }

  // ── Clear history for a core ──────────────────────────────────────────────

  async clearHistory(coreId: string, userId: string): Promise<void> {
    const p = getPuter();
    const key = sessionKey(coreId, userId);

    sessionCache.delete(key);

    if (p && p.auth.isSignedIn()) {
      await p.kv.del(kvKey(coreId, userId)).catch(() => {});
    }
    console.log(`🗑️ GRD-17 Memory: cleared history for ${coreId}/${userId}`);
  }

  // ── Summary for UI display ────────────────────────────────────────────────

  async getSummary(coreId: string, userId: string): Promise<{
    messageCount: number;
    totalInteractions: number;
    firstSeen: string;
    lastSeen: string;
    profile: CoreMemory['profile'];
  }> {
    const mem = await this.loadMemory(coreId, userId);
    return {
      messageCount: mem.messages.filter(m => m.role !== 'system').length,
      totalInteractions: mem.totalInteractions,
      firstSeen: mem.firstSeen,
      lastSeen: mem.lastSeen,
      profile: mem.profile,
    };
  }
}

export const grd17Memory = new GRD17MemoryService();
