/**
 * GRD-17 Puter.js Cloud Storage Integration - GRUDGE STUDIO
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 *
 * Provides Puter.js free cloud storage for GRD-17 data,
 * linked to the player's Grudge ID (puter account created with Grudge branding).
 *
 * Puter SDK: https://js.puter.com/v2/
 * All KV keys use the "grudge_grd17_" prefix to avoid collisions.
 * All FS paths are under /GRUDA/grd17/ for Grudge namespace isolation.
 */

import { GRUDGE_BACKEND_URL } from './grd17AutomationAPI';

// ── Puter KV key constants ──────────────────────────────────────────────────

export const PUTER_KV = {
  automationConfig:  (userId: string) => `grudge_grd17_automation_${userId}`,
  modelPreference:   (userId: string) => `grudge_grd17_model_${userId}`,
  walletData:        (userId: string) => `grudge_grd17_wallet_${userId}`,
  nodeConfig:        (userId: string) => `grudge_grd17_node_${userId}`,
  lastSync:          (userId: string) => `grudge_grd17_sync_${userId}`,
  grudgeId:          (userId: string) => `grudge_grd17_id_${userId}`,
} as const;

// ── Puter FS path constants ─────────────────────────────────────────────────

export const PUTER_FS = {
  base:        '/GRUDA/grd17',
  automation:  '/GRUDA/grd17/automation',
  wallets:     '/GRUDA/grd17/wallets',
  nodeConfig:  '/GRUDA/grd17/node',
  models:      '/GRUDA/grd17/models',
} as const;

// ── Types ───────────────────────────────────────────────────────────────────

export interface GrudgeUser {
  puterUid: string;
  grudgeId: string;
  username: string;
  isAuthenticated: boolean;
  linkedAt: string;
}

export interface GRD17AutomationConfig {
  enabledRules: string[];
  disabledRules: string[];
  customRules: unknown[];
  preferredModel: string;
  lastUpdated: string;
}

export interface GRD17StorageState {
  user: GrudgeUser | null;
  automationConfig: GRD17AutomationConfig | null;
  walletPublicKey: string | null;
  nodeConfig: Record<string, unknown> | null;
  lastSync: string | null;
}

// ── Puter instance accessor (browser only) ──────────────────────────────────

declare const puter: {
  auth: {
    isSignedIn(): boolean;
    signIn(): Promise<void>;
    signOut(): Promise<void>;
    getUser(): Promise<{ uuid: string; username: string }>;
  };
  kv: {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
    del(key: string): Promise<void>;
  };
  fs: {
    mkdir(path: string, options?: { createMissingParents?: boolean; dedupeName?: boolean }): Promise<void>;
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

// ── GRD-17 Puter Service ─────────────────────────────────────────────────────

class GRD17PuterService {
  private state: GRD17StorageState = {
    user: null,
    automationConfig: null,
    walletPublicKey: null,
    nodeConfig: null,
    lastSync: null,
  };

  // ── Auth ─────────────────────────────────────────────────────────────────

  async signIn(): Promise<GrudgeUser | null> {
    const p = getPuter();
    if (!p) {
      console.warn('⚠️ GRD-17: Puter SDK not loaded — add <script src="https://js.puter.com/v2/"></script>');
      return null;
    }

    if (!p.auth.isSignedIn()) {
      await p.auth.signIn();
    }

    const puterUser = await p.auth.getUser();

    // Link puter account to Grudge ID via backend
    const grudgeId = await this.linkToGrudgeId(puterUser.uuid);

    const user: GrudgeUser = {
      puterUid: puterUser.uuid,
      grudgeId,
      username: puterUser.username,
      isAuthenticated: true,
      linkedAt: new Date().toISOString(),
    };

    this.state.user = user;

    // Persist Grudge linkage in Puter KV
    await p.kv.set(PUTER_KV.grudgeId(puterUser.uuid), JSON.stringify(user));

    console.log(`✅ GRD-17: Signed in as ${user.username} (GrudgeID: ${user.grudgeId})`);
    return user;
  }

  async signOut(): Promise<void> {
    const p = getPuter();
    if (p && p.auth.isSignedIn()) {
      await p.auth.signOut();
    }
    this.state = {
      user: null,
      automationConfig: null,
      walletPublicKey: null,
      nodeConfig: null,
      lastSync: null,
    };
    console.log('👋 GRD-17: Signed out of Puter');
  }

  isSignedIn(): boolean {
    const p = getPuter();
    return !!p && p.auth.isSignedIn();
  }

  getUser(): GrudgeUser | null {
    return this.state.user;
  }

  // ── Grudge ID linkage ────────────────────────────────────────────────────

  private async linkToGrudgeId(puterUuid: string): Promise<string> {
    try {
      const resp = await fetch(`${GRUDGE_BACKEND_URL}/api/grudge-id/link-puter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puterUuid }),
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.grudgeId ?? `grudge_${puterUuid.slice(0, 8)}`;
      }
    } catch (err) {
      console.warn('⚠️ GRD-17: Could not link to Grudge ID, using local fallback');
    }
    return `grudge_${puterUuid.slice(0, 8)}`;
  }

  // ── Automation config ────────────────────────────────────────────────────

  async saveAutomationConfig(config: GRD17AutomationConfig): Promise<void> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return;

    const payload = JSON.stringify({ ...config, lastUpdated: new Date().toISOString() });

    // KV: fast access
    await p.kv.set(PUTER_KV.automationConfig(user.puterUid), payload);

    // FS: persistent backup
    await p.fs.write(
      `${PUTER_FS.automation}/config.json`,
      payload,
      { createMissingParents: true },
    );

    this.state.automationConfig = config;
    console.log('💾 GRD-17: Automation config saved to Puter cloud');
  }

  async loadAutomationConfig(): Promise<GRD17AutomationConfig | null> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return null;

    try {
      const raw = await p.kv.get(PUTER_KV.automationConfig(user.puterUid));
      if (raw) {
        const config = JSON.parse(raw) as GRD17AutomationConfig;
        this.state.automationConfig = config;
        console.log('📥 GRD-17: Automation config loaded from Puter KV');
        return config;
      }
    } catch (err) {
      // Fall back to FS
      try {
        const file = await p.fs.read(`${PUTER_FS.automation}/config.json`);
        const config = JSON.parse(await file.text()) as GRD17AutomationConfig;
        this.state.automationConfig = config;
        console.log('📥 GRD-17: Automation config loaded from Puter FS');
        return config;
      } catch {
        console.warn('⚠️ GRD-17: No saved automation config found');
      }
    }
    return null;
  }

  // ── Model preference ─────────────────────────────────────────────────────

  async saveModelPreference(modelId: string): Promise<void> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return;
    await p.kv.set(PUTER_KV.modelPreference(user.puterUid), modelId);
    console.log(`💾 GRD-17: Model preference saved: ${modelId}`);
  }

  async loadModelPreference(): Promise<string> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return 'grd17';
    const pref = await p.kv.get(PUTER_KV.modelPreference(user.puterUid));
    return pref ?? 'grd17';
  }

  // ── Wallet data ──────────────────────────────────────────────────────────

  async saveWalletPublicKey(publicKey: string): Promise<void> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return;

    // Only store the PUBLIC key — never store secret keys in cloud!
    await p.kv.set(PUTER_KV.walletData(user.puterUid), publicKey);
    await p.fs.write(
      `${PUTER_FS.wallets}/wallet.json`,
      JSON.stringify({ publicKey, savedAt: new Date().toISOString(), grudgeId: user.grudgeId }),
      { createMissingParents: true },
    );
    this.state.walletPublicKey = publicKey;
    console.log('💾 GRD-17: Wallet public key saved to Puter cloud');
  }

  async loadWalletPublicKey(): Promise<string | null> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return null;
    const key = await p.kv.get(PUTER_KV.walletData(user.puterUid));
    this.state.walletPublicKey = key;
    return key;
  }

  // ── Sync timestamp ───────────────────────────────────────────────────────

  async markSynced(): Promise<void> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return;
    const ts = new Date().toISOString();
    await p.kv.set(PUTER_KV.lastSync(user.puterUid), ts);
    this.state.lastSync = ts;
  }

  async getLastSync(): Promise<string | null> {
    const p = getPuter();
    const user = this.state.user;
    if (!p || !user) return null;
    return p.kv.get(PUTER_KV.lastSync(user.puterUid));
  }

  // ── Full state ───────────────────────────────────────────────────────────

  getState(): GRD17StorageState {
    return { ...this.state };
  }
}

export const grd17Puter = new GRD17PuterService();
