# NEXUS LIFE-OS (Personal-Tracker)

A personal and civil-engineering command centre: mind-map tasks with bill-of-quantities costing, budgeting on the 50/30/20
framework with USD/LKR toggle, health and gym tracking (TDEE, macros, Epley 1RM), bloodwork analysis, and an executive briefing.

See [`docs/NEXUS_ANALYSIS.md`](docs/NEXUS_ANALYSIS.md) for what the system is, how the original spec maps to this build, and what remains.

## Run

```bash
npm install
npm run dev      # http://localhost:3000 (binds 0.0.0.0)
# or
npm run build && npm run start
```

Checks: `npm run typecheck`, `npm run build`.

## Configuration (optional)

Copy `.env.example` to `.env.local`. Without `GEMINI_API_KEY` the app runs fully offline: bloodwork uploads report that
analysis needs the key, and manual entry still works. Data is stored in the browser's `localStorage`.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Framer Motion · @xyflow/react + dagre · Recharts · Zod · Lucide.

## Integrated To Do Space and monthly packages

- `/todo` opens Orbit (both original commits, through `7d1dc4e`) inside a full-width NEXUS workspace; `/orbit/index.html` opens it standalone. Orbit keeps its own existing localStorage data and is not automatically merged with the legacy BOQ task model.
- `/mindmap` uses the same full-width shell.
- Orbit builds into ignored `public/orbit` before Next dev/build. The integrated iframe loads a static production bundle, not a second dev server or HMR client. Standalone Orbit development no longer forces the HMR port to 443, which is unsuitable for localhost.
- `/subscriptions` tracks mobile, utility and subscription plans, manual data balances, expiry and official HTTPS provider links. Saving records or updates one expense per package per selected billing month. A new month must be explicitly recorded; there is no background charging or assumed payment. Removing a package retains historical expenses.
- Costs use the existing USD ledger and fixed 308 LKR/USD conversion. Finance charts currently aggregate the existing ledger, not only the selected packages month.
- Usage is **not live**: browser apps cannot read MyDialog or other apps' private storage. A real integration needs an authorised provider API or supported export; no credentials are collected.
- Run `npm test` after `npm run build:orbit` for Orbit layout/UI and billing regression tests.

Verification: production build, TypeScript, 531 layout checks, 61 UI checks, billing add/update/monthly deduplication and retained-history smoke test. HTTP checks cover briefing, Orbit, mind map, packages and Finance. This is not a real-device mobile-provider integration test.

Known inherited dependency risk: `npm audit --omit=dev` reports critical/high advisories in the existing Next 14 stack. A framework upgrade and regression pass remain necessary before exposing a public production deployment.
