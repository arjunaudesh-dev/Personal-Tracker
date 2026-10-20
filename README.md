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
