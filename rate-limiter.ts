/**
 * GRD-17 Rate Limiter — Prevent Excessive API Calls
 * GRUDGE STUDIO / GRUDACHAIN
 *
 * Token-bucket rate limiter per GRD-17 core:
 *  - 10 requests / minute (refills every 6 seconds)
 *  - 100 requests / day  (tracked in Puter KV, resets at midnight UTC)
 *  - 500 ms minimum debounce between calls to the same core
 *  - Exponential backoff on consecutive failures (max 30s)
 *
 * Usage:
 *   const allowed = await rateLimiter.check('grd17', userId);
 *   if (!allowed.ok) throw new Error(allowed.reason);
 *   // ... make call ...
 *   rateLimiter.recordSuccess('grd17', userId);
 *   // or on error:
 *   rateLimiter.recordFailure('grd17', userId);
 */

// ── Config ────────────────────────────────────────────────────────────────────

const REQUESTS_PER_MINUTE   = 10;
const REQUESTS_PER_DAY      = 100;
const DEBOUNCE_MS           = 500;
const MAX_BACKOFF_MS        = 30_000;
const BACKOFF_BASE_MS       = 1_000;
const AUTOMATION_POLL_MS    = 30_000;  // min interval for automation status polling

// Puter KV key for daily counter
const dailyKey = (coreId: string, userId: string, dateStr: string) =>
  `grudge_grd17_rl_${coreId}_${userId}_${dateStr}`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface RateCheckResult {
  ok: boolean;
  reason?: string;
  retryAfterMs?: number;
}

interface BucketState {
  tokens: number;
  lastRefill: number;
  lastCall: number;
  failureCount: number;
  nextAllowed: number;
}

// ── Puter KV (optional daily cap tracking) ───────────────────────────────────

declare const puter: {
  auth: { isSignedIn(): boolean };
  kv: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
  };
};
function getPuter() {
  if (typeof window !== 'undefined' && typeof (window as any).puter !== 'undefined') {
    return (window as any).puter as typeof puter;
  }
  return null;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Rate Limiter ──────────────────────────────────────────────────────────────

class GRD17RateLimiter {
  private buckets = new Map<string, BucketState>();
  /** Debounce timers per core+user */
  private debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
  /** Automation poll timestamps to throttle status checks */
  private pollTimestamps = new Map<string, number>();

  private key(coreId: string, userId: string) {
    return `${coreId}::${userId}`;
  }

  private getBucket(coreId: string, userId: string): BucketState {
    const k = this.key(coreId, userId);
    if (!this.buckets.has(k)) {
      this.buckets.set(k, {
        tokens:       REQUESTS_PER_MINUTE,
        lastRefill:   Date.now(),
        lastCall:     0,
        failureCount: 0,
        nextAllowed:  0,
      });
    }
    return this.buckets.get(k)!;
  }

  /** Refill token bucket based on elapsed time */
  private refill(bucket: BucketState) {
    const now     = Date.now();
    const elapsed = now - bucket.lastRefill;
    const refillTokens = Math.floor(elapsed / (60_000 / REQUESTS_PER_MINUTE));
    if (refillTokens > 0) {
      bucket.tokens     = Math.min(REQUESTS_PER_MINUTE, bucket.tokens + refillTokens);
      bucket.lastRefill = now;
    }
  }

  /** Check and consume a token. Returns ok=true if call is allowed. */
  async check(coreId: string, userId: string): Promise<RateCheckResult> {
    const bucket = this.getBucket(coreId, userId);
    const now    = Date.now();

    // 1. Backoff check (after consecutive failures)
    if (now < bucket.nextAllowed) {
      return {
        ok: false,
        reason: `Backoff active — ${coreId} recovering from errors`,
        retryAfterMs: bucket.nextAllowed - now,
      };
    }

    // 2. Debounce check
    const sinceLastCall = now - bucket.lastCall;
    if (bucket.lastCall > 0 && sinceLastCall < DEBOUNCE_MS) {
      return {
        ok: false,
        reason: `Too fast — wait ${DEBOUNCE_MS - sinceLastCall}ms`,
        retryAfterMs: DEBOUNCE_MS - sinceLastCall,
      };
    }

    // 3. Per-minute token bucket
    this.refill(bucket);
    if (bucket.tokens <= 0) {
      const waitMs = (60_000 / REQUESTS_PER_MINUTE) - (now - bucket.lastRefill);
      return {
        ok: false,
        reason: `Rate limit: ${REQUESTS_PER_MINUTE} requests/minute per core`,
        retryAfterMs: Math.max(0, waitMs),
      };
    }

    // 4. Daily cap (Puter KV if available, else in-memory estimate)
    const dailyCount = await this.getDailyCount(coreId, userId);
    if (dailyCount >= REQUESTS_PER_DAY) {
      return {
        ok: false,
        reason: `Daily limit reached: ${REQUESTS_PER_DAY} requests/day per core`,
        retryAfterMs: msUntilMidnightUTC(),
      };
    }

    // All checks passed — consume token
    bucket.tokens   -= 1;
    bucket.lastCall  = now;
    await this.incrementDailyCount(coreId, userId, dailyCount);

    return { ok: true };
  }

  recordSuccess(coreId: string, userId: string) {
    const bucket = this.getBucket(coreId, userId);
    bucket.failureCount = 0;
    bucket.nextAllowed  = 0;
  }

  recordFailure(coreId: string, userId: string) {
    const bucket = this.getBucket(coreId, userId);
    bucket.failureCount += 1;
    const backoff = Math.min(
      MAX_BACKOFF_MS,
      BACKOFF_BASE_MS * Math.pow(2, bucket.failureCount - 1),
    );
    bucket.nextAllowed = Date.now() + backoff;
    console.warn(`⚠️ GRD-17 [${coreId}]: backoff ${backoff}ms (failure #${bucket.failureCount})`);
  }

  /** Throttle automation polling to at most once per AUTOMATION_POLL_MS */
  shouldPoll(pollKey: string): boolean {
    const last = this.pollTimestamps.get(pollKey) ?? 0;
    const now  = Date.now();
    if (now - last < AUTOMATION_POLL_MS) return false;
    this.pollTimestamps.set(pollKey, now);
    return true;
  }

  /** Debounced wrapper — calls fn only if no call made in DEBOUNCE_MS */
  debounce<T>(key: string, fn: () => Promise<T>, delayMs = DEBOUNCE_MS): Promise<T> {
    return new Promise((resolve, reject) => {
      const existing = this.debounceTimers.get(key);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(async () => {
        this.debounceTimers.delete(key);
        try {
          resolve(await fn());
        } catch (err) {
          reject(err);
        }
      }, delayMs);
      this.debounceTimers.set(key, timer);
    });
  }

  /** Usage summary for debugging */
  getStatus(coreId: string, userId: string): {
    tokens: number;
    failureCount: number;
    nextAllowed: number;
  } {
    const b = this.getBucket(coreId, userId);
    this.refill(b);
    return {
      tokens:       b.tokens,
      failureCount: b.failureCount,
      nextAllowed:  b.nextAllowed,
    };
  }

  // ── Daily count helpers ────────────────────────────────────────────────────

  private dailyCountCache = new Map<string, number>();

  private async getDailyCount(coreId: string, userId: string): Promise<number> {
    const k = dailyKey(coreId, userId, todayUTC());
    if (this.dailyCountCache.has(k)) return this.dailyCountCache.get(k)!;

    const p = getPuter();
    if (p && p.auth.isSignedIn()) {
      try {
        const raw = await p.kv.get(k);
        const count = raw ? parseInt(raw, 10) : 0;
        this.dailyCountCache.set(k, count);
        return count;
      } catch {}
    }
    return 0;
  }

  private async incrementDailyCount(coreId: string, userId: string, current: number) {
    const k       = dailyKey(coreId, userId, todayUTC());
    const updated = current + 1;
    this.dailyCountCache.set(k, updated);

    const p = getPuter();
    if (p && p.auth.isSignedIn()) {
      // TTL = 25 hours so it auto-expires after the day
      p.kv.set(k, String(updated), { ttl: 25 * 3600 }).catch(() => {});
    }
  }
}

function msUntilMidnightUTC(): number {
  const now  = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return next.getTime() - now.getTime();
}

export const rateLimiter = new GRD17RateLimiter();

// Re-export config so components can display limits
export const RATE_LIMITS = {
  requestsPerMinute: REQUESTS_PER_MINUTE,
  requestsPerDay:    REQUESTS_PER_DAY,
  debounceMs:        DEBOUNCE_MS,
  automationPollMs:  AUTOMATION_POLL_MS,
} as const;
