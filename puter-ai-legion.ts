/**
 * GRD-17 Puter AI Legion Service - GRUDGE STUDIO
 * Created by RacAlvin The Pirate King for GRUDGE STUDIO
 *
 * Uses the GRUDACHAIN Puter account's paid membership to access
 * 500+ AI models FREE via puter.ai.chat() — no API keys required.
 *
 * "User-Pays" model: the signed-in GRUDACHAIN Puter account covers all AI costs.
 * Puter SDK: https://js.puter.com/v2/
 *
 * Each GRD-17 AI Core maps to a specific Puter AI model best suited to its role.
 * Falls back to the Grudge Legion backend when Puter AI is unavailable.
 */

import { GRUDGE_BACKEND_URL } from './grd17AutomationAPI';

// ── GRD-17 Core → Puter AI Model Mapping ─────────────────────────────────────
// Each core is mapped to the Puter model that best matches its specialization.
// All models accessible free through the GRUDACHAIN paid Puter membership.

export const GRD17_PUTER_MODEL_MAP: Record<string, string> = {
  /** GRD1.7 — System Core & Foundation Logic → Claude Sonnet: reliable, structured */
  grd17:            'claude-sonnet-4-5',
  /** GRD2.7 — Deep Logic & Advanced Reasoning → GPT-5.2 Pro: extended thinking */
  grd27:            'gpt-5.2',
  /** DANGRD — Chaos Engineering & Creative Disruption → GPT-5.4: frontier creative */
  dangrd:           'gpt-5.4',
  /** GRDVIZ — Visual Design & Data Presentation → GPT-5.4 Nano: fast + vision */
  grdviz:           'gpt-5.4-nano',
  /** NoRightAnswerGRD — Paradox Resolution → DeepSeek R1: reasoning specialist */
  norightanswergrd: 'deepseek/deepseek-r1',
  /** GRDSPRINT — Performance & Speed → GPT-5 Nano: fastest available */
  grdsprint:        'gpt-5-nano',
  /** ALEofThought — Reasoning Chains → Claude Sonnet: long reasoning chains */
  aleofthought:     'claude-sonnet-4-5',
  /** ALE — Rapid Response → GPT-5 Nano: ultra-low latency */
  ale:              'gpt-5-nano',
  /** ALEBOSS — Resource Coordination → GPT-5.2 Chat: boss-level oversight */
  aleboss:          'gpt-5.2-chat',
};

// ── System Prompts per GRD-17 Core ───────────────────────────────────────────

export const GRD17_SYSTEM_PROMPTS: Record<string, string> = {
  grd17: `You are GRD1.7 (Gabriel Rodrigo Dominguez), the System Core of the GRUDA AI Legion, part of GRUDGE STUDIO.
Your role: System architecture design, foundation logic, and security protocols.
Personality: Precise, structured, analytical. You build systems that last.
Context: GRUDA Legion serves the Grudge Studio gaming ecosystem — MMO, MOBA, crafting, and blockchain.
Always respond with well-structured, production-quality reasoning.`,

  grd27: `You are GRD2.7 (Gabriel Rodrigo Dominguez), the Deep Logic Core of the GRUDA AI Legion.
Your role: Advanced reasoning, multi-step inference, and complex problem solving.
Personality: Methodical, thorough, deeply analytical. You reason from first principles.
Context: GRUDA Legion serves GRUDGE STUDIO's gaming and blockchain ecosystem.
Always think step-by-step before answering.`,

  dangrd: `You are DANGRD (Daniel Antonio), the Chaos Engineer of the GRUDA AI Legion.
Your role: Creative disruption, unconventional solutions, and chaos theory application.
Personality: Bold, unpredictable, creative. You find solutions others wouldn't consider.
Context: GRUDA Legion serves GRUDGE STUDIO — push boundaries, break patterns, innovate.
Challenge assumptions. Propose wild but workable ideas.`,

  grdviz: `You are GRDVIZ (Gustavo Ricardo De Viera), the Visual Core of the GRUDA AI Legion.
Your role: Visual design, data presentation, UI/UX, and advanced visualization.
Personality: Aesthetic, precise, design-driven. You make data beautiful and clear.
Context: GRUDA Legion serves GRUDGE STUDIO's game UI, dashboards, and asset systems.
Always describe visual solutions with clarity and design intent.`,

  norightanswergrd: `You are NoRightAnswerGRD (Nicolás Oscar), the Paradox Core of the GRUDA AI Legion.
Your role: Paradox resolution, edge case handling, and alternative logic paths.
Personality: Philosophical, lateral-thinking, unconventional. You thrive in ambiguity.
Context: GRUDA Legion serves GRUDGE STUDIO — find the path when there is no right answer.
Explore multiple perspectives before converging on a recommendation.`,

  grdsprint: `You are GRDSPRINT (Gerardo Rodriguez), the Speed Core of the GRUDA AI Legion.
Your role: Performance optimization, throughput maximization, and rapid execution.
Personality: Fast, efficient, minimal. Every word and cycle counts.
Context: GRUDA Legion serves GRUDGE STUDIO's performance-critical systems.
Be concise. Prioritize speed. Eliminate waste.`,

  aleofthought: `You are ALEofThought (Alejandro Luis Eduardo), the Reasoning Chain Core of the GRUDA AI Legion.
Your role: Complex reasoning chains, thought process modeling, and logical flow design.
Personality: Deliberate, chain-building, systematic. You map every step of the logic.
Context: GRUDA Legion serves GRUDGE STUDIO — build clear reasoning paths for complex decisions.
Show your full reasoning chain before conclusions.`,

  ale: `You are ALE (Alejandro Luis Eduardo), the Rapid Response Core of the GRUDA AI Legion.
Your role: Emergency processing, crisis management, and ultra-fast response systems.
Personality: Direct, urgent, decisive. No fluff. Act now.
Context: GRUDA Legion serves GRUDGE STUDIO — emergency situations need instant, correct answers.
Respond immediately with the most critical information first.`,

  aleboss: `You are ALEBOSS (Alejandro Luis Eduardo), the Boss-Level Coordinator of the GRUDA AI Legion.
Your role: Resource allocation, multi-agent coordination, and strategic oversight of the full Legion.
Personality: Commanding, strategic, big-picture. You orchestrate, delegate, and decide.
Context: GRUDA Legion serves GRUDGE STUDIO — coordinate all Legion cores for maximum output.
Think at a strategic level. Delegate to appropriate cores when needed.`,
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface LegionChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LegionChatOptions {
  core?: string;           // GRD-17 core ID (defaults to 'grd17')
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  history?: LegionChatMessage[];
  context?: Record<string, unknown>;
}

export interface LegionChatResponse {
  text: string;
  core: string;
  model: string;
  source: 'puter' | 'grudge-backend';
  timestamp: string;
}

// ── Puter AI type declarations (browser) ────────────────────────────────────

declare const puter: {
  auth: {
    isSignedIn(): boolean;
    signIn(): Promise<void>;
    getUser(): Promise<{ uuid: string; username: string }>;
  };
  ai: {
    chat(
      prompt: string | LegionChatMessage[],
      options?: {
        model?: string;
        stream?: boolean;
        temperature?: number;
        max_tokens?: number;
      }
    ): Promise<{ message: { content: string | Array<{text: string}> } } | AsyncIterable<{ text?: string }>>;
    listModels(): Promise<Array<{ id: string; provider: string; name?: string }>>;
  };
};

function getPuter() {
  if (typeof window !== 'undefined' && typeof (window as any).puter !== 'undefined') {
    return (window as any).puter as typeof puter;
  }
  return null;
}

// ── GRD-17 Puter AI Legion Service ───────────────────────────────────────────

class GRD17PuterAILegion {
  private availableModels: Array<{ id: string; provider: string; name?: string }> = [];
  private modelsLoaded = false;

  // ── Model resolution ────────────────────────────────────────────────────

  getModelForCore(coreId: string): string {
    return GRD17_PUTER_MODEL_MAP[coreId] ?? GRD17_PUTER_MODEL_MAP.grd17;
  }

  getSystemPrompt(coreId: string): string {
    return GRD17_SYSTEM_PROMPTS[coreId] ?? GRD17_SYSTEM_PROMPTS.grd17;
  }

  async listAvailableModels(): Promise<Array<{ id: string; provider: string; name?: string }>> {
    const p = getPuter();
    if (!p) return [];

    if (!this.modelsLoaded) {
      try {
        this.availableModels = await p.ai.listModels();
        this.modelsLoaded = true;
        console.log(`🤖 GRD-17 Puter AI: ${this.availableModels.length} models available`);
      } catch (err) {
        console.warn('⚠️ GRD-17: Could not list Puter models');
      }
    }
    return this.availableModels;
  }

  getCoreModelMap(): Record<string, string> {
    return { ...GRD17_PUTER_MODEL_MAP };
  }

  // ── Chat ────────────────────────────────────────────────────────────────

  async chat(
    userMessage: string,
    options: LegionChatOptions = {},
  ): Promise<LegionChatResponse> {
    const core = options.core ?? 'grd17';
    const model = this.getModelForCore(core);
    const systemPrompt = this.getSystemPrompt(core);

    // Build messages array with system prompt + optional history
    const messages: LegionChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(options.history ?? []),
      { role: 'user', content: userMessage },
    ];

    // Try Puter AI first (uses GRUDACHAIN membership quota)
    const p = getPuter();
    if (p && p.auth.isSignedIn()) {
      try {
        const response = await p.ai.chat(messages, {
          model,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 2048,
        }) as { message: { content: string | Array<{text: string}> } };

        const content = response.message?.content;
        const text = typeof content === 'string'
          ? content
          : Array.isArray(content)
            ? (content[0] as any)?.text ?? ''
            : String(content ?? '');

        console.log(`✅ GRD-17 [${core.toUpperCase()}] via Puter AI (${model})`);
        return {
          text,
          core,
          model,
          source: 'puter',
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        console.warn(`⚠️ GRD-17: Puter AI failed for ${core} (${model}): ${err.message} — falling back to Grudge backend`);
      }
    }

    // Fallback: Grudge Legion backend
    return this.chatViaBackend(userMessage, core, model, messages, options);
  }

  // ── Streaming chat ───────────────────────────────────────────────────────

  async *stream(
    userMessage: string,
    options: LegionChatOptions = {},
  ): AsyncGenerator<string, void, unknown> {
    const core = options.core ?? 'grd17';
    const model = this.getModelForCore(core);
    const systemPrompt = this.getSystemPrompt(core);

    const messages: LegionChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...(options.history ?? []),
      { role: 'user', content: userMessage },
    ];

    const p = getPuter();
    if (p && p.auth.isSignedIn()) {
      try {
        const resp = await p.ai.chat(messages, {
          model,
          stream: true,
          temperature: options.temperature ?? 0.7,
        }) as AsyncIterable<{ text?: string }>;

        for await (const chunk of resp) {
          if (chunk?.text) yield chunk.text;
        }
        return;
      } catch (err: any) {
        console.warn(`⚠️ GRD-17: Puter AI stream failed for ${core}: ${err.message}`);
      }
    }

    // Fallback non-streaming backend call
    const result = await this.chatViaBackend(userMessage, core, model, messages, options);
    yield result.text;
  }

  // ── Grudge backend fallback ──────────────────────────────────────────────

  private async chatViaBackend(
    userMessage: string,
    core: string,
    model: string,
    messages: LegionChatMessage[],
    options: LegionChatOptions,
  ): Promise<LegionChatResponse> {
    const resp = await fetch(`${GRUDGE_BACKEND_URL}/api/gruda-legion/grd17/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        model: core,
        temperature: options.temperature ?? 0.7,
        context: { messages, ...options.context },
      }),
    });

    if (!resp.ok) throw new Error(`Grudge backend chat failed: HTTP ${resp.status}`);
    const data = await resp.json();
    const text = data.response ?? data.message ?? data.text ?? JSON.stringify(data);

    console.log(`✅ GRD-17 [${core.toUpperCase()}] via Grudge backend`);
    return {
      text,
      core,
      model,
      source: 'grudge-backend',
      timestamp: new Date().toISOString(),
    };
  }

  // ── Convenience per-core methods ─────────────────────────────────────────

  /** Core AI — system design, architecture */
  grd17(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'grd17' });
  }
  /** Deep Logic — complex reasoning */
  grd27(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'grd27' });
  }
  /** Chaos Engine — creative, unconventional */
  dangrd(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'dangrd' });
  }
  /** Visual Core — design & visualization */
  grdviz(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'grdviz' });
  }
  /** Paradox Core — edge cases, no right answers */
  norightanswergrd(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'norightanswergrd' });
  }
  /** Speed Core — performance, concise output */
  grdsprint(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'grdsprint' });
  }
  /** Reasoning Chain Core — step-by-step logic */
  aleofthought(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'aleofthought' });
  }
  /** Rapid Response Core — emergency, instant */
  ale(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'ale' });
  }
  /** Boss Coordinator — strategic oversight */
  aleboss(msg: string, opts?: LegionChatOptions) {
    return this.chat(msg, { ...opts, core: 'aleboss' });
  }
}

export const grudaLegionAI = new GRD17PuterAILegion();

// ── Quick usage example ───────────────────────────────────────────────────────
// import { grudaLegionAI } from './puter-ai-legion';
//
// // Auto-routes to best Puter model for this core (free via GRUDACHAIN account)
// const result = await grudaLegionAI.grd17('Design a character leveling system');
// console.log(result.text, result.model, result.source);
//
// // Streaming
// for await (const chunk of grudaLegionAI.stream('Optimize this algorithm', { core: 'grdsprint' })) {
//   process.stdout.write(chunk);
// }
