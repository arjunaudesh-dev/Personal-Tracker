# NEXUS LIFE-OS

**Personal & Civil Engineering Command Center** — a unified personal operating system that
consolidates five historically disparate domains into one high-performance web platform.

> **Operator:** Officer Arjuna Kahandawa (Civil Engineer Officer)
> **Paradigm:** Next.js 14 App Router · Reactive mind-map graph engine · Multimodal AI · Dual
> IoT/wearable bridge · Apache XAMPP reverse bridge
> **Status:** Production-active build 1.0.0 — designed mobile-first so the same modules can be
> lifted into a native container later.

---

## 1. Executive system overview

| # | Module | Directory | What it does |
|---|--------|-----------|--------------|
| A | **Mind-Map, BOQ & CAD Engine** | `src/components/mindmap/` | Left-to-right dagre graph, branch collapse/expand, bottom-up progress rollup, itemized Bill of Quantities, cross-space dependency web, freehand CAD overlay |
| B | **Financial & Budget Command Center** | `src/components/finance/` | 50/30/20 discipline, task-linked committed spend, cashflow waterfall, adherence donut, category variance, dual-currency (USD/LKR @ 308) |
| C | **Health, Athletic & Wearable Sync Hub** | `src/components/health/` | Google Fit / Health Connect telemetry, dynamic TDEE & macro planner, hypertrophy gym coach with Epley 1RM, sleep architecture monitor |
| D | **Gemini Vision Bloodwork Analyzer** | `src/app/api/analyze-bloodwork/` | Multimodal PDF/image extraction into validated biomarker JSON, automated corrective-task spawning |
| E | **Cross-System Executive Briefing** | `src/components/briefing/` | 4 holistic KPI cards + 3-column bento (timeline & alarms, AI war-room & bottlenecks, telemetry & 3-second quick capture) |

---

## 2. Technology stack

| Layer | Technologies | Version | Purpose |
|-------|--------------|---------|---------|
| Framework | Next.js (App Router), React, ReactDOM | ^14.2.23 / ^18.3.1 | Core SSR/CSR hybrid runtime, routing, layout engine |
| Language | TypeScript | ^5.7.3 | End-to-end strict static type safety |
| Graph visualization | `@xyflow/react`, `dagre` | ^12.12.0 / ^0.8.5 | Left-to-right mind-map canvas, auto-layout, edge routing |
| UI styling | Tailwind CSS, PostCSS, Autoprefixer | ^3.4.17 / ^8.5.1 | Dark-mode glassmorphic design-token system |
| Motion & icons | Framer Motion, Lucide React | ^14.3.0 / ^0.474.0 | Physics transitions, bento animations, iconography |
| Data visualization | Recharts | ^2.15.1 | Cashflow waterfall, 50/30/20 donut, biometric sparklines |
| AI intelligence | `@google/genai` | ^2.30.0 | Gemini 2.5 Flash / Pro with structured JSON schema outputs |
| Validation | Zod | ^3.24.1 | Runtime schema validation for webhooks, telemetry and AI payloads |
| Utilities | `clsx`, `tailwind-merge`, `date-fns` | latest | Class resolution, date arithmetic |
| Databases | `@supabase/supabase-js`, `firebase` | ^2.48.1 / ^11.2.0 | PostgreSQL mirror + Firestore document sync |
| Infrastructure | Apache XAMPP, Node.js v24 | Port 80 & 3000 | Windows workstation native hosting and local access |

---

## 3. Getting started

```bash
npm install
cp .env.example .env.local     # optional — every integration degrades gracefully
npm run dev                     # http://localhost:3000
```

Production build:

```bash
npm run build
npm run start                   # http://localhost:3000
```

Quality gates:

```bash
npm run typecheck               # tsc --noEmit — 0 errors
npm run build                   # 0 errors / 0 warnings
```

### XAMPP / Apache bridge

`index.php` sits at the repository root and is served by Apache on **port 80**. It performs a
non-blocking TCP probe (`fsockopen`) against `127.0.0.1:3000`:

* **Node online** → renders an embedded low-latency viewport with an operational status banner,
  or hard-redirects with `index.php?redirect=1`.
* **Node offline** → renders an interactive diagnostic terminal with live subsystem health
  indicators and a 1-click daemon launcher.

---

## 4. Architecture highlights

### Module A — mind-map engine
* **Horizontal LR hierarchy** — dagre `rankdir: 'LR'`, `nodesep: 34`, `ranksep: 92`; edges flow
  from the source right handle to the target left handle.
* **Branch collapse / expansion** — `getHiddenNodeIds()` recomputes the visible node set while
  preserving dagre alignment.
* **Bottom-up progress rollup** — `rollupProgress()` aggregates leaf completion into parents;
  parents are flagged `isAutoCalculated`.
* **Itemized BOQ ledger** — `Qty × Rate = Total` per line, aggregated into node `cashflow`
  metadata and mirrored into the Financial module.
* **Cross-space dependency web** — `depends_on / blocks / relates_to` edges rendered as dashed
  glowing bezier paths.
* **Undo / redo** — `useCanvasHistory` snapshots status, progress, collapse state and node
  positions (`Ctrl+Z` / `Ctrl+Y`).

### Module B — financial command center
* Needs 50 % · Wants 30 % · Savings & sinking 20 %, with live variance against plan.
* Committed capital is derived from mind-map node `cashflow.committed`.
* USD ⇄ LKR toggle at a standardized **308 LKR/USD**.

### Module C — health & athletic hub
* Telemetry types: `com.google.step_count.delta`, `com.google.calories.expended`,
  `com.google.heart_rate.bpm`, `com.google.sleep.segment`.
* TDEE = Mifflin-St Jeor BMR × activity factor + workout burn adjustment.
* Protein target = `bodyweight × 2.2 g`; 1RM = `weight × (1 + reps ÷ 30)` (Epley).

### Module D — clinical lab analyzer
* `POST /api/analyze-bloodwork` accepts a PDF or image, sends it to Gemini 2.5 Vision with
  `responseMimeType: application/json` + `responseSchema`, and validates the reply with Zod.
* Out-of-range biomarkers render a one-click **[+ Add Corrective Task to Mind-Map]** action that
  generates a linked health-tree node.

### Module E — executive briefing
* 4 KPI cards → cross-system routing.
* Column 1 timeline (06:00–22:00) with alarms and Google Calendar sync.
* Column 2 AI war-room directives + live bottleneck checklist + `wa.me` dispatch deep links.
* Column 3 dual sparklines, 7-day outflow velocity with instant currency toggle, and a
  3-second quick capture bar (**+ Expense · + Sub-Task · + Meal**).

---

## 5. AI pipeline & safety guardrails

`src/lib/ai/`

| Concern | Implementation |
|---------|----------------|
| Model partitioning | `gemini-2.5-flash` for interactive actions (15 RPM) · `gemini-2.5-pro` for deep clinical reasoning (2 RPM) |
| Caching | `cache-manager.ts` — SHA-256 deterministic keys, configurable TTL, LRU eviction, hit-rate telemetry |
| Rate limiting | `rate-limiter.ts` — token bucket per model, exponential backoff with full jitter, guaranteed zero 429 exhaustion |
| Execution | `ai-service.ts` — unified executor with retry, cache read-through and a **deterministic local fallback engine** so every AI surface works with no API key |

The local engine (`local-engine.ts`) reproduces the exact Gemini output contract for financial
advice, war-room directives, clinical review, meal plans, subtask drafts and workout reviews.

---

## 6. Data architecture

* `src/db/schema.sql` — PostgreSQL/Supabase DDL: `mindmap_tasks`, `task_cross_group_links`,
  `financial_transactions`, `wearable_daily_metrics`, `training_sessions`, `nutrition_logs`,
  `lab_reports`, `lab_biomarkers`, row-level-security policies and a recursive
  `rollup_task_progress()` helper.
* `firestore.rules` — ownership-scoped rules for the document mirror.
* The running application persists to `localStorage` (`nexus-life-os:state:v1`) so it is fully
  functional without infrastructure; the Supabase/Firebase clients are the production sync path.

---

## 7. Codebase catalog

```
Personal-Tracker/
├── .env.example                 # required environment variables template
├── firestore.rules              # Firestore security rules for users & tasks
├── index.php                    # Apache XAMPP bridge & port 3000 proxy router
├── next.config.mjs              # Next.js configuration
├── package.json                 # NPM manifest & dependency specifications
├── tailwind.config.ts           # Tailwind theme tokens, glassmorphism gradients
├── tsconfig.json                # TypeScript compiler options (strict, path aliases)
├── db/schema.sql                # PostgreSQL / Supabase DDL schema definition
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── ai/route.ts                    # Unified AI executor endpoint
    │   │   ├── analyze-bloodwork/route.ts     # Gemini 2.5 Vision lab extraction
    │   │   ├── health/summary/route.ts        # Health aggregate for mobile clients
    │   │   └── wearable/sync/route.ts         # Google Fit / Health Connect bridge
    │   ├── globals.css                        # Custom scrollbars, glassmorphic React Flow controls
    │   ├── layout.tsx                         # Root HTML/body shell and metadata
    │   └── page.tsx                           # Master Command Shell, tab state, ⌘K palette
    ├── components/
    │   ├── briefing/                          # Module E
    │   ├── finance/                           # Module B
    │   ├── health/                            # Module C & D
    │   ├── mindmap/                           # Module A
    │   ├── navigation/                        # App header & command palette
    │   └── ui/                                # Design-system primitives
    ├── lib/
    │   ├── ai/                                # cache-manager, rate-limiter, ai-service, local-engine
    │   ├── client/                            # firebase, google-workspace, integrations/wearable-sync
    │   ├── config/                            # operator profile
    │   ├── db/schema.sql                      # relational DDL
    │   ├── parser/                            # schemas, supabase client, utilities
    │   └── types/                             # finance, health, mindmap, nexus contracts
    └── store/                                 # reducer, persistence, selectors, provider
```

---

## 8. Architectural invariants & quality standards

1. **File length ceiling** — every component and utility stays comfortably under 240 lines;
   complex views are decomposed into sub-components (`drawer-tabs/`, `briefing/`).
2. **TypeScript strictness** — `npm run typecheck` compiles with **0 errors**.
3. **Next.js production build** — `npm run build` completes with **0 errors / 0 warnings**.
4. **Dual-port operational parity** — the system is fully operational on both
   `http://localhost:3000` (Next.js daemon) and `http://localhost/Personal-Tracker/`
   (Apache reverse bridge).
5. **Graceful degradation** — no external credential is required for the platform to run; the
   Gemini engine, wearable bridge, Supabase mirror, Google Calendar sync and Firestore mirror
   each fall back to a deterministic local implementation.

---

## 9. Roadmap toward the mobile app

The interface is already mobile-adaptive (single-column bento collapse, sticky module nav,
touch-sized controls, `viewport-fit=cover`, installable `manifest.webmanifest`). The next
increment lifts the four API routes into a typed client SDK and swaps the `localStorage` adapter
for the Supabase adapter — the module contracts in `src/lib/types/` are already transport
agnostic.
