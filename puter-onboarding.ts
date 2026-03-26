/**
 * GRUDGE STUDIO — Puter Onboarding Service
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 *
 * ═══════════════════════════════════════════════════════════════
 *  THE SCHEME
 * ═══════════════════════════════════════════════════════════════
 *
 *  GRUDACHAIN  = our Puter account → admin, Legion AI backend
 *                (uses me.puter in Puter Workers for backend ops)
 *
 *  EVERY USER  = their own Puter account (temp or real)
 *                → their AI/storage usage = Puter Incentive
 *                  Program (PIP) REVENUE for GRUDGE STUDIO
 *
 *  FLOW:
 *  1. User lands on any Grudge Studio app
 *  2. autoOnboard() fires silently (no UI interruption)
 *  3. If not Puter-signed-in → attempt_temp_user_creation creates
 *     a silent temporary Puter account instantly
 *  4. Puter UUID → POST /api/grudge-id/link-puter → Grudge ID
 *  5. Grudge ID is the single identity across ALL auth methods
 *     (Discord / Web3Auth / Solana wallet / email / guest)
 *  6. Every puter.ai.chat(), puter.kv.set(), puter.fs.write()
 *     the user makes charges THEIR Puter account
 *     → GRUDGE STUDIO earns PIP revenue from that engagement
 *  7. Temp accounts can be "claimed" by registering an email
 *     (upgrades to permanent Puter account, keeps all data)
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { GRUDGE_BACKEND_URL } from './grd17AutomationAPI';

// ── Grudge ID service URL ─────────────────────────────────────────────────────
// grudge-id service is at id.grudge-studio.com (proxied from api.grudge-studio.com)
const GRUDGE_ID_URL = `${GRUDGE_BACKEND_URL}/api/grudge-id`;

// ── Types ─────────────────────────────────────────────────────────────────────

export type AuthMethod = 'puter' | 'discord' | 'wallet' | 'web3auth' | 'email' | 'guest';

export interface PuterUserInfo {
  uuid: string;
  username: string;
  isTemp: boolean;        // true = guest/temp Puter account
  emailConfirmed: boolean;
  subscribed: boolean;    // paid Puter plan
}

export interface GrudgeIdentity {
  grudgeId: string;
  puterUuid: string;
  username: string;
  isTemp: boolean;        // guest player (no claimed Puter account)
  isNew: boolean;         // first time we've seen this Puter UUID
  linkedAuth: {
    discord?: string;
    walletAddress?: string;
    web3authId?: string;
    email?: string;
  };
  pipActive: boolean;     // true when user is generating PIP revenue
  createdAt: string;
  lastSeen: string;
}

// ── Puter type declarations (browser) ────────────────────────────────────────

declare const puter: {
  auth: {
    isSignedIn(): boolean;
    signIn(options?: { attempt_temp_user_creation?: boolean }): Promise<void>;
    signOut(): Promise<void>;
    getUser(): Promise<{
      uuid: string;
      username: string;
      is_temp: boolean;
      email_confirmed: boolean;
      subscribed: boolean;
    }>;
  };
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

// ── KV storage keys (all prefixed with grudge_) ───────────────────────────────

const KV = {
  grudgeId:    (puterUuid: string) => `grudge_identity_id_${puterUuid}`,
  linkedAuth:  (puterUuid: string) => `grudge_identity_auth_${puterUuid}`,
  onboarded:   (puterUuid: string) => `grudge_onboarded_${puterUuid}`,
} as const;

// ── GRD-17 Puter Onboarding Service ──────────────────────────────────────────

class GrudgePuterOnboardingService {
  private identity: GrudgeIdentity | null = null;
  private puterUser: PuterUserInfo | null = null;
  private onboardingPromise: Promise<GrudgeIdentity | null> | null = null;

  // ── Core: auto-onboard on page load ──────────────────────────────────────

  /**
   * Call this once on app init.
   * Silently creates/links a Puter account for every visitor.
   * Returns the user's Grudge Identity.
   *
   * ✅ Zero UI interruption for temp accounts
   * ✅ Idempotent — safe to call multiple times
   * ✅ Generates PIP revenue from first interaction
   */
  async autoOnboard(): Promise<GrudgeIdentity | null> {
    // Return cached result if already onboarded this session
    if (this.identity) return this.identity;

    // Deduplicate concurrent calls
    if (this.onboardingPromise) return this.onboardingPromise;

    this.onboardingPromise = this._doOnboard();
    return this.onboardingPromise;
  }

  private async _doOnboard(): Promise<GrudgeIdentity | null> {
    const p = getPuter();
    if (!p) {
      console.warn('⚠️ GRUDGE: Puter SDK not loaded — include <script src="https://js.puter.com/v2/"></script>');
      return null;
    }

    try {
      // 1. Silently sign in or create temp Puter account
      if (!p.auth.isSignedIn()) {
        // attempt_temp_user_creation = true → creates account with zero user friction
        await p.auth.signIn({ attempt_temp_user_creation: true });
      }

      // 2. Get Puter user details
      const raw = await p.auth.getUser();
      this.puterUser = {
        uuid:           raw.uuid,
        username:       raw.username,
        isTemp:         raw.is_temp,
        emailConfirmed: raw.email_confirmed,
        subscribed:     raw.subscribed,
      };

      // 3. Check if we already have a local KV record (fast path)
      const cachedId = await p.kv.get(KV.grudgeId(raw.uuid)).catch(() => null);
      if (cachedId) {
        const cachedAuth = await p.kv.get(KV.linkedAuth(raw.uuid)).catch(() => null);
        this.identity = {
          grudgeId:    cachedId,
          puterUuid:   raw.uuid,
          username:    raw.username,
          isTemp:      raw.is_temp,
          isNew:       false,
          linkedAuth:  cachedAuth ? JSON.parse(cachedAuth) : {},
          pipActive:   true,
          createdAt:   '',
          lastSeen:    new Date().toISOString(),
        };
        console.log(`✅ GRUDGE: Identity loaded from cache — ${cachedId} (${raw.is_temp ? 'guest' : 'member'})`);
        return this.identity;
      }

      // 4. Link to Grudge ID via backend (creates or retrieves)
      const identity = await this._linkToBackend({ puterUuid: raw.uuid, isTemp: raw.is_temp, username: raw.username });

      // 5. Cache in Puter KV (30 days) so next load is instant
      if (identity) {
        await p.kv.set(KV.grudgeId(raw.uuid), identity.grudgeId, { ttl: 30 * 24 * 3600 });
        await p.kv.set(KV.onboarded(raw.uuid), 'true', { ttl: 30 * 24 * 3600 });
        console.log(`✅ GRUDGE: Onboarded as ${identity.grudgeId} [PIP: active, temp: ${raw.is_temp}]`);
      }

      this.identity = identity;
      return identity;
    } catch (err: any) {
      console.warn('⚠️ GRUDGE: Onboarding failed (non-blocking):', err.message);
      return null;
    } finally {
      this.onboardingPromise = null;
    }
  }

  // ── Link other auth methods to the same Grudge ID ────────────────────────

  /**
   * Call after Discord OAuth, Web3Auth, or wallet connect.
   * Links the auth credential to this user's Grudge ID.
   * All auth methods resolve to a single Grudge ID.
   */
  async linkAuth(method: AuthMethod, credential: string): Promise<GrudgeIdentity | null> {
    if (!this.identity) await this.autoOnboard();
    if (!this.identity) return null;

    try {
      const resp = await fetch(`${GRUDGE_ID_URL}/link-auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grudgeId:   this.identity.grudgeId,
          puterUuid:  this.identity.puterUuid,
          authMethod: method,
          credential,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        this.identity = { ...this.identity, ...data };

        // Cache updated auth links in Puter KV
        const p = getPuter();
        if (p && this.identity.puterUuid) {
          await p.kv.set(
            KV.linkedAuth(this.identity.puterUuid),
            JSON.stringify(this.identity.linkedAuth),
            { ttl: 30 * 24 * 3600 },
          );
        }

        console.log(`🔗 GRUDGE: Linked ${method} → ${this.identity.grudgeId}`);
      }
    } catch (err: any) {
      console.warn(`⚠️ GRUDGE: Auth link failed (${method}):`, err.message);
    }

    return this.identity;
  }

  // ── Upgrade: temp → permanent Puter account ───────────────────────────────

  /**
   * Prompt the user to register an email and claim their temp Puter account.
   * Must be called from a user interaction (button click).
   * After claiming, their temp account becomes permanent — all data preserved.
   *
   * @returns true if successfully claimed, false if dismissed
   */
  async claimAccount(): Promise<boolean> {
    const p = getPuter();
    if (!p) return false;

    if (!this.puterUser?.isTemp) {
      console.log('GRUDGE: Account already claimed');
      return true;
    }

    try {
      // Calling signIn() on a temp user triggers the "claim account" flow in Puter UI
      await p.auth.signIn();
      const updated = await p.auth.getUser();

      if (!updated.is_temp) {
        // Successfully claimed — update our records
        if (this.identity) {
          this.identity.isTemp = false;
          this.puterUser.isTemp = false;
          this.puterUser.username = updated.username;
        }

        // Notify backend of the upgrade
        await this._linkToBackend({
          puterUuid: updated.uuid,
          isTemp:    false,
          username:  updated.username,
        }).catch(() => {});

        console.log(`✅ GRUDGE: Account claimed! Welcome ${updated.username}`);
        return true;
      }
    } catch (err: any) {
      console.warn('⚠️ GRUDGE: Claim dismissed or failed:', err.message);
    }
    return false;
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  getIdentity():   GrudgeIdentity | null { return this.identity; }
  getPuterUser():  PuterUserInfo  | null { return this.puterUser; }
  isOnboarded():   boolean { return !!this.identity; }
  isGuest():       boolean { return this.identity?.isTemp ?? true; }
  isPIPActive():   boolean { return !!this.identity?.pipActive; }

  grudgeId():   string | null { return this.identity?.grudgeId   ?? null; }
  puterUuid():  string | null { return this.identity?.puterUuid  ?? null; }

  /**
   * Returns a summary of PIP revenue status for display in UI.
   * This player's usage is generating revenue for GRUDGE STUDIO.
   */
  getPIPSummary(): {
    active: boolean;
    accountType: 'guest' | 'member' | 'subscriber';
    grudgeId: string | null;
    note: string;
  } {
    const isTemp       = this.puterUser?.isTemp ?? true;
    const isSubscribed = this.puterUser?.subscribed ?? false;
    const accountType  = isSubscribed ? 'subscriber' : isTemp ? 'guest' : 'member';

    return {
      active:      !!this.identity,
      accountType,
      grudgeId:    this.identity?.grudgeId ?? null,
      note: isTemp
        ? 'Playing as guest — claim your account to save progress permanently'
        : isSubscribed
          ? 'Subscribed Puter member — maximum AI access'
          : 'Puter member — cloud saves enabled',
    };
  }

  // ── Backend linkage ───────────────────────────────────────────────────────

  private async _linkToBackend(params: {
    puterUuid: string;
    isTemp:    boolean;
    username:  string;
  }): Promise<GrudgeIdentity | null> {
    const resp = await fetch(`${GRUDGE_ID_URL}/link-puter`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(params),
    });

    if (!resp.ok) {
      throw new Error(`link-puter failed: HTTP ${resp.status}`);
    }

    return resp.json() as Promise<GrudgeIdentity>;
  }
}

export const grudgeOnboarding = new GrudgePuterOnboardingService();

// ── Integration guide ──────────────────────────────────────────────────────
//
// Add to your app entry point (runs on every page load, zero UI friction):
//
//   import { grudgeOnboarding } from './puter-onboarding';
//
//   // On app init — silently creates/links Puter account
//   const identity = await grudgeOnboarding.autoOnboard();
//   // identity.grudgeId → use as userId everywhere in grudaLegionAI.chat()
//
// After Discord login:
//   await grudgeOnboarding.linkAuth('discord', discordUserId);
//
// After wallet connect:
//   await grudgeOnboarding.linkAuth('wallet', walletPublicKey);
//
// Prompt guest to claim account (from button click only):
//   document.getElementById('claim-btn').onclick = () => grudgeOnboarding.claimAccount();
//
// Check PIP status:
//   const pip = grudgeOnboarding.getPIPSummary();
//   // { active: true, accountType: 'guest', grudgeId: 'grudge_abc123', ... }
