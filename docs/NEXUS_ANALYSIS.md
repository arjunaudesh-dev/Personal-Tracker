# NEXUS LIFE-OS — System Identification & Rebuild Notes

Source: `as at 20 Oct 26.pdf` (11 pages, scanned; read page-by-page) and the repository `arjunaudesh-dev/Personal-Tracker`
(at the time of the rebuild it contained only a one-line README, so the PDF was the sole source of the original design).

## 1. What the system is

**NEXUS LIFE-OS** — a personal executive operating system and civil-engineering command console, operated by
Officer Arjuna Kahandawa (civil engineer). It consolidates five domains into one Next.js web app:

| Module | Original spec (PDF) | Rebuilt in this repo |
|---|---|---|
| A. Mind-map, BOQ & CAD | React Flow + Dagre LR layout, collapse, bottom-up rollup, BOQ (qty × rate), civil datasets | `/mindmap` — React Flow + dagre (`rankdir: LR`, `nodesep: 40`, `ranksep: 90`), collapse chevrons, rollup, BOQ inspector, group filter, search |
| B. Finance & budget | 50/30/20, cash-flow waterfall, donut, planned-vs-actual, USD/LKR at 308, AI advisor | `/finance` — same framework, charts, ledger, dual currency at 308 LKR/USD, transaction ↔ task linking. AI advisor **not** rebuilt yet |
| C. Health & wearables | Google Fit telemetry, TDEE & macros, gym logger with Epley 1RM | `/health` — Mifflin–St Jeor BMR, TDEE × activity, goal shift, protein ≥ 180 g floor, meal and workout logs, Epley 1RM. Google Fit sync **not** rebuilt (sample telemetry only) |
| D. Bloodwork analyser | Gemini 2.5 Pro vision → strict JSON schema → biomarker cards → corrective task spawn | `/bloodwork` + `POST /api/analyze-bloodwork` — Gemini REST call with `responseSchema` when `GEMINI_API_KEY` is set; manual entry and rule-based flags work offline; corrective tasks spawn into the Health tree. Google Tasks sync **not** rebuilt |
| E. Executive briefing | Top KPIs, timeline with alarms, AI war-room, bottleneck checklist, WhatsApp `wa.me` dispatch, sparklines, 3-second quick capture | `/` — all of the above except the live AI strategy text and Google Calendar sync (UI toggle only) |

## 2. Architecture (from the PDF)

- Next.js 14 App Router, React 18, TypeScript (strict), Tailwind CSS, Framer Motion, Recharts, Zod, Lucide.
- Graph: `@xyflow/react` + `dagre`.
- AI: Google Gemini (`@google/genai`). Model partitioning: `gemini-2.5-flash` for interactive actions (15 RPM), `gemini-2.5-pro` for clinical interpretation (2 RPM); MD5/SHA deterministic in-memory cache with TTL; token-bucket rate limiter with exponential backoff.
- Data: PostgreSQL/Supabase schema (`mindmap_tasks`, `task_cross_group_links`, `financial_transactions` — see PDF §7) plus Firebase/Firestore rules.
- Hosting: Windows workstation, Node.js 3000 behind Apache (XAMPP) on port 80 via an `index.php` bridge.

## 3. Model identification

The "model" in the request is the **NEXUS LIFE-OS** application above: a single-operator, local-first personal and civil
project command system. It is *not* an ML model. The only AI model named in the document is Google Gemini 2.5
(Flash for interactive use, Pro for clinical extraction). The request mentioned "GLM 5.3"; that model does not appear in the
PDF, and this sandbox could not verify its availability or API. The AI layer is therefore implemented against Gemini as the
document specifies, through one server route (`src/app/api/analyze-bloodwork/route.ts`), so another provider can be swapped in there.

## 4. Decisions and deviations

- **Local-first persistence.** The rebuild stores state in `localStorage` (key `nexus-life-os:v2`) so it runs without
  Supabase/Firebase credentials. The SQL schema from the PDF is not yet wired in.
- **Invariants kept:** every component file is under 240 lines; `npm run typecheck` (tsc --noEmit) and `npm run build` pass
  with zero warnings/errors.
- **Security patch:** `next` is pinned to **14.2.35** (the PDF's 14.2.23 has a published advisory). Other versions follow the PDF.
- **Clinical content.** Reference ranges in `src/lib/biomarkers.ts` are conservative adult defaults. The app is informational;
  clinical decisions belong with a clinician, and the UI says so.
- **Not included from the PDF:** the XAMPP `index.php` bridge, `.agents/mcp_config.json`, the Google Calendar / Tasks / Fit
  integrations, the Cmd-K palette, CAD overlay, undo/redo, and the AI financial advisor. These are candidates for the next iteration.

## 5. Suggested next steps

1. Wire `db/schema.sql` (Supabase) behind the existing store interface (`src/lib/store.tsx`) so the same actions write to the DB.
2. Add the AI advisor (flash model) for budget directives and the war-room summary, reusing the rate limiter and cache from the PDF.
3. Add Google Calendar/Tasks and Google Fit adapters behind server routes.
4. Add the Cmd-K palette and undo/redo (`useCanvasHistory`) on the mind-map.
