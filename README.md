# GRUDACHAIN · GRD-17

**A Data Solution and Security Chain** — GRUDGE STUDIO

> 9 specialized AI cores · 500+ models via Puter · Persistent memory · Rate-limited · Production-ready

[![Docs](https://img.shields.io/badge/docs-grudgedadev.github.io-7c3aed)](https://grudgedadev.github.io/gruda_grd-17/)
[![API](https://img.shields.io/badge/API-api.grudge--studio.com-10b981)](https://api.grudge-studio.com)
[![Version](https://img.shields.io/badge/version-GRD--17.2.1-4f46e5)](#)

---

## Overview

GRD-17 is the AI data layer for GRUDGE STUDIO. It powers the **GRUDA Legion** — nine specialized AI cores backed by the GRUDACHAIN Puter account's paid membership. Every user's conversation history is persisted in Puter KV/FS so models always know their full context with each user.

## AI Cores → Puter Model Map

| Core ID | Name | Best At | Puter Model |
|---|---|---|---|
| `grd17` | GRD1.7 System Core | Architecture, security | `claude-sonnet-4-5` |
| `grd27` | GRD2.7 Deep Logic | Complex reasoning | `gpt-5.2` |
| `dangrd` | DANGRD Chaos Engine | Creative disruption | `gpt-5.4` |
| `grdviz` | GRDVIZ Visual Core | UI/UX, data viz | `gpt-5.4-nano` |
| `norightanswergrd` | NoRightAnswerGRD | Paradox resolution | `deepseek/deepseek-r1` |
| `grdsprint` | GRDSPRINT Speed | Performance, speed | `gpt-5-nano` |
| `aleofthought` | ALEofThought | Reasoning chains | `claude-sonnet-4-5` |
| `ale` | ALE Rapid Response | Emergency, instant | `gpt-5-nano` |
| `aleboss` | ALEBOSS Coordinator | Strategic oversight | `gpt-5.2-chat` |

## Quick Start

```html
<!-- 1. Include Puter SDK -->
<script src="https://js.puter.com/v2/"></script>
```

```ts
// 2. Sign in + use Legion AI (memory enabled)
import { grudaLegionAI } from './puter-ai-legion';

const user = await puter.auth.getUser();
const result = await grudaLegionAI.chat('Design a leveling system', {
  core:   'grd17',
  userId: user.uuid,   // enables persistent memory
});
console.log(result.text, result.model, result.source);
// → "..." | "claude-sonnet-4-5" | "puter"
```

## Key Files

| File | Purpose |
|---|---|
| `puter-ai-legion.ts` | Main Legion AI service with core mapping + chat/stream |
| `puter-memory.ts` | Persistent conversation history via Puter KV + FS |
| `rate-limiter.ts` | Token bucket: 10 req/min, 100/day, 500ms debounce |
| `puter-integration.ts` | Puter auth, wallet, automation config storage |
| `grd17AutomationAPI.ts` | Automation rule engine (routes to Grudge VPS) |
| `GRD17AutomationController.tsx` | React UI for automation management |
| `blockchain/RealWalletManager.tsx` | Solana wallet UI (public key synced to Puter) |
| `docs/index.html` | GitHub Pages documentation site |

## Production Environment Variables

```env
# Grudge Studio VPS
GRUDACHAIN_URL=https://api.grudge-studio.com
GAME_API_GRUDA=https://api.grudge-studio.com

# Puter AI — GRUDACHAIN paid account API key
PUTER_API_KEY=your_grudachain_puter_api_key

# Fallback providers (optional)
LEGION_HUB_API_KEY=...
XAI_API_KEY=...
```

Get `PUTER_API_KEY` from [puter.com](https://puter.com) → Account Settings → API Keys (GRUDACHAIN account).

## Rate Limits

- **10 requests/minute** per core per user (token bucket, auto-refills)
- **100 requests/day** per core per user (resets at midnight UTC, tracked in Puter KV)
- **500ms debounce** minimum between calls to the same core
- **Exponential backoff** on failures (1s → 2s → 4s → … max 30s)
- **Automation polling**: minimum 30s interval (enforced by `rateLimiter.shouldPoll()`)

## Memory System

Conversation history stored per user per core:
- **Puter KV** (fast read/write, 30-day rolling TTL)
- **Puter FS** backup at `/GRUDA/grd17/memory/{coreId}/{userId}.json`
- Max 20 messages kept (10 user + 10 assistant turns)
- User relationship profile: topics, style, active projects

```ts
import { grd17Memory } from './puter-memory';
await grd17Memory.clearHistory('grd17', userId);  // reset a core's history
await grd17Memory.updateProfile('grd17', userId, { interactionStyle: 'technical' });
```

## API Endpoints

All served via `https://api.grudge-studio.com`:

```
POST /api/gruda-legion/puter-ai/chat     — Puter AI chat (server-side)
GET  /api/gruda-legion/puter-ai/models   — Core → model map
GET  /api/gruda-legion/puter-ai/status   — Provider chain status
GET  /api/gruda-legion/grd17/model-info  — Full core metadata
POST /api/gruda-legion/grd17/chat        — GRD-17 model chat
GET  /api/gruda-legion/grd17/automation/status
GET  /api/gruda-legion/grd17/blockchain/stats
POST /api/gruda-legion/grd17/blockchain/create-wallet
```

## Documentation

Full documentation: **https://grudgedadev.github.io/gruda_grd-17/**

---

*Version GRD-17.2.1 · Last Updated: March 2026 · Created by RacAlvin The Pirate King for GRUDGE STUDIO*

GRUDGE AI Model Specifications
GRD1.7 - GRUDGE AI Primary Core
Core Specialization: System Coordination and Primary Operations Processing Style: Methodical and comprehensive Framework Strengths: System architecture, coordination protocols GRUDGE AI Identity: Primary System Core Role: System Coordination Leader

GRD2.7 - GRUDGE AI Deep Logic
Core Specialization: Deep Logic and Complex Analysis Processing Style: Analytical depth with mathematical precision Framework Strengths: Complex problem solving, algorithmic thinking GRUDGE AI Identity: Deep Logic Processor Role: Advanced Analysis Engine

ALEofThought - GRUDGE AI Reasoning
Core Specialization: Reasoning Chains and Decision Making Processing Style: Step-by-step logical progression Framework Strengths: Decision trees, cognitive reasoning GRUDGE AI Identity: Reasoning Engine Role: Decision Logic Coordinator

DANGRD - GRUDGE AI Chaos Engine
Core Specialization: Chaos Engineering and Edge Case Handling Processing Style: Unpredictable logic patterns Framework Strengths: Stress testing, chaos injection GRUDGE AI Identity: Chaos Engineering Core Role: Edge Case Specialist

GRDVIZ - GRUDGE AI Vision Core
Core Specialization: Visual Design and UI/UX Optimization Processing Style: Creative visual thinking Framework Strengths: Interface design, user experience GRUDGE AI Identity: Visual Intelligence Core Role: UI/UX Design Specialist

NoRightAnswerGRD - GRUDGE AI Paradox
Core Specialization: Paradox Resolution and Contradiction Analysis Processing Style: Contrarian and alternative perspective Framework Strengths: Devil's advocate, alternative solutions GRUDGE AI Identity: Paradox Resolution Core Role: Alternative Perspective Engine

ALE - GRUDGE AI Swift Response
Core Specialization: Rapid Response and Swift Processing Processing Style: High-speed decision making Framework Strengths: Real-time processing, instant responses GRUDGE AI Identity: Swift Response Core Role: Rapid Processing Engine

GRDSPRINT - GRUDGE AI Speed Demon
Core Specialization: Performance Optimization and Speed Enhancement Processing Style: Efficiency-focused processing Framework Strengths: Performance tuning, speed optimization GRUDGE AI Identity: Performance Optimization Core Role: Speed Enhancement Specialist

GRUDGE AI Coordination Matrix
Processing Speed Rankings
ALE (GRUDGE AI Swift Response): 1.8x - Rapid Response
GRDSPRINT (GRUDGE AI Speed Demon): 1.5x - Speed Optimization
DANGRD (GRUDGE AI Chaos Engine): 1.2x - Chaos Engineering
GRD1.7 (GRUDGE AI Primary Core): 1.0x - System Core
GRDVIZ (GRUDGE AI Vision Core): 1.0x - Visual Design
ALEofThought (GRUDGE AI Reasoning): 0.9x - Reasoning Chains
GRD2.7 (GRUDGE AI Deep Logic): 0.8x - Deep Logic
NoRightAnswerGRD (GRUDGE AI Paradox): 0.7x - Paradox Resolution
Confidence Levels
GRD2.7 (GRUDGE AI Deep Logic): 92% - Deep Logic
ALE (GRUDGE AI Swift Response): 91% - Rapid Response
GRD1.7 (GRUDGE AI Primary Core): 88% - System Core
ALEofThought (GRUDGE AI Reasoning): 86% - Reasoning Chains
GRDSPRINT (GRUDGE AI Speed Demon): 85% - Speed Optimization
GRDVIZ (GRUDGE AI Vision Core): 82% - Visual Design
NoRightAnswerGRD (GRUDGE AI Paradox): 79% - Paradox Resolution
DANGRD (GRUDGE AI Chaos Engine): 75% - Chaos Engineering
GRUDGE AI Specialization Framework
System Operations
Primary: GRD1.7 (GRUDGE AI Primary Core)
Secondary: GRD2.7 (GRUDGE AI Deep Logic)
Support: ALEofThought (GRUDGE AI Reasoning)
Performance Optimization
Primary: GRDSPRINT (GRUDGE AI Speed Demon)
Secondary: ALE (GRUDGE AI Swift Response)
Support: GRD1.7 (GRUDGE AI Primary Core)
Creative & Visual
Primary: GRDVIZ (GRUDGE AI Vision Core)
Secondary: ALEofThought (GRUDGE AI Reasoning)
Support: NoRightAnswerGRD (GRUDGE AI Paradox)
Problem Solving
Primary: GRD2.7 (GRUDGE AI Deep Logic)
Secondary: ALEofThought (GRUDGE AI Reasoning)
Support: DANGRD (GRUDGE AI Chaos Engine)
Edge Cases & Testing
Primary: DANGRD (GRUDGE AI Chaos Engine)
Secondary: NoRightAnswerGRD (GRUDGE AI Paradox)
Support: ALE (GRUDGE AI Swift Response)
External Framework Integration Compatibility
smolagents Framework
Compatible Models: All GRUDGE AI models
Integration Method: Maintains individual GRUDGE AI identities within framework
Coordination: GRD1.7 serves as primary coordinator
rig Framework
Compatible Models: All GRUDGE AI models
Integration Method: GRUDGE AI models operate as specialized agents
Coordination: Task distribution based on specialization matrix
swarms-tools Framework
Compatible Models: All GRUDGE AI models
Integration Method: GRUDGE AI swarm with specialized roles
Coordination: Dynamic role assignment based on task requirements
GRUDGE AI Task Assignment Logic
def assign_grudge_ai_task(task_type, complexity, urgency):
    """
    GRUDGE AI task assignment algorithm
    """
    if task_type == "security" or task_type == "system_admin":
        return "GRD1.7"  # GRUDGE AI Primary Core
    
    if urgency > 0.8:
        return "ALE"  # GRUDGE AI Swift Response
    
    if complexity > 0.9:
        return "GRD2.7"  # GRUDGE AI Deep Logic
    
    if task_type == "ui" or task_type == "design":
        return "GRDVIZ"  # GRUDGE AI Vision Core
    
    if task_type == "performance":
        return "GRDSPRINT"  # GRUDGE AI Speed Demon
    
    if task_type == "edge_case" or task_type == "chaos":
        return "DANGRD"  # GRUDGE AI Chaos Engine
    
    if task_type == "contradiction" or task_type == "alternative":
        return "NoRightAnswerGRD"  # GRUDGE AI Paradox
    
    if task_type == "reasoning" or task_type == "decision":
        return "ALEofThought"  # GRUDGE AI Reasoning
    
    # Default to Primary Core
    return "GRD1.7"  # GRUDGE AI Primary Core
GRUDGE AI Communication Protocols
Inter-AI Communication
All GRUDGE AI models communicate through standardized GRUDGE protocols
Coordination handled by GRD1.7 (GRUDGE AI Primary Core)
Task handoffs maintain context and quality standards
External Integration
GRUDGE AI models maintain their specialized identities when integrated with external frameworks
Framework compatibility layer preserves GRUDGE AI characteristics
Performance metrics tracked across all integrations
Quality Assurance
All GRUDGE AI outputs validated by peer review system
Cross-validation between complementary specializations
Continuous learning and improvement protocols
Development Guidelines
Framework Integration Rules
Preserve GRUDGE AI Identity: All models maintain their GRUDGE AI branding
Respect Specializations: Use each model according to its core strengths
Maintain Coordination: GRD1.7 oversees all integrations
Quality Standards: All outputs meet GRUDGE STUDIO quality requirements
Best Practices
Leverage each GRUDGE AI model's unique strengths
Use coordination matrix for optimal task distribution
Maintain consistency across all GRUDGE AI communications
Regular performance monitoring and optimization
This document maintains the complete individual identity profiles for all GRUDGE AI models while enabling external framework integration for enhanced capabilities.

All AI models are proprietary GRUDGE STUDIO technology and branded as GRUDGE AI.

Document Version: 2.0 Last Updated: December 28, 2024 Author: GRUDGE STUDIO
