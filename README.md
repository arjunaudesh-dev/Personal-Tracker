# NEXUS LIFE-OS // Master Executive Command Center

**Unified Personal Executive Operating System & Civil Engineering Command Console**  
*Operator: Officer Arjuna Kahandawa (Civil Engineer Officer)*  
*System Designation: NEXUS LIFE-OS*  
*Deployment State: Production Active (`http://localhost:3000` & `http://localhost/Personal-Tracker/`)*  
*Architecture: Next.js 14 App Router • Reactive Mind-Map Graph Engine • Multimodal AI Intelligence • Dual IoT/Wearable Bridge • Apache XAMPP Reverse Proxy*

---

## 1. Executive System Overview

NEXUS LIFE-OS consolidates historically disparate command domains into a single high-performance tactical web platform:

1. **Interactive Mind-Map & BOQ Engine (Module A)**: Left-to-Right hierarchical graph visualizer built on `@xyflow/react` and `dagre` (`rankdir: 'LR'`, `nodesep: 40`, `ranksep: 90`), featuring bottom-up auto-progress rollup, multi-board workspaces, itemized Bill of Quantities (BOQ $Qty \times Rate = Total$), military CMSYS sync, CAD blueprint markup overlay, and 5-tab slide-over inspector drawer.
2. **Financial Velocity & Budget Planner (Module B)**: 50/30/20 budget framework (Needs 50%, Wants 30%, Savings 20%), cashflow waterfall projections, sinking fund/debt tracking, task-linked committed spend, and real-time dual-currency engine (USD / Sri Lankan Rupee LKR at standardized 308 LKR/USD).
3. **Health, Athletic & Wearable Sync Hub (Module C)**: Telemetry pipeline for Xiaomi Mi Band & Mibro GT/GS smartwatches via Google Fit REST API / Android Health Connect (resting HR 58 bpm, sleep score 88/100, steps, active calories), dynamic TDEE macro targets (protein $\ge 180\text{g}$), and hypertrophy workout coach with Epley 1RM estimation ($1RM = Weight \times (1 + \frac{Reps}{30})$).
4. **Multimodal AI Bloodwork & Clinical Lab Analyzer (Module D)**: Google Gemini 2.5 Vision pipeline extracting structured biomarkers from clinical lab reports across Lipid Panel, Glycemic Control, Organ Health (ALT/AST, Creatinine/eGFR), and Micronutrients (Vitamin D3 25-OH, B12, Testosterone) with 1-click corrective task spawning into the Mind-Map.
5. **Cross-System Executive Briefing (Module E)**: 3-column Bento Grid synchronizing daily 06:00–22:00 timelines, Google Calendar & alarms, active civil bottlenecks (Harbor Floating Dock, Sea Wall Tidal Armoring, Admin Building 1st Floor Slab Concrete), 1-click WhatsApp dispatch links (`wa.me`), and 3-second quick capture bar.

---

## 2. Technology Stack & Architectural Standards

- **Core Framework**: Next.js 14.2 (App Router, SSR/CSR hybrid runtime)
- **Language**: TypeScript 5.7 (strict mode, 0 errors under `npm run typecheck`)
- **Graph & DAG Engine**: `@xyflow/react`, `dagre`
- **UI & Styling**: Tailwind CSS, dark glassmorphism design tokens
- **Data Visualization**: Recharts (Cashflow Waterfall, 50/30/20 Donut, Planned vs Actual Bar, Sleep vs HR Sparklines)
- **AI Intelligence**: Gemini 2.5 Flash / Pro partitioned execution with in-memory TTL caching and token-bucket rate limiting (15 RPM / 2 RPM)
- **Validation**: Zod schema validation
- **Database & DDL**: PostgreSQL / Supabase schema definition (`src/db/schema.sql`) with UUID v4, foreign key cascades, and CHECK constraints
- **Dual-Port Operational Parity**: Operational across direct Next.js daemon on port 3000 and Apache XAMPP reverse proxy bridge (`index.php`)
- **File Length Invariant**: All components and utility files strictly adhere to under 240 lines of code.

---

## 3. Directory Structure

```
Personal-Tracker/
├── .agents/
│   └── mcp_config.json               # MCP server declarations (GitHub, Google, Shell)
├── .env.example                      # Required environment variables template
├── firestore.rules                   # Firebase security rules
├── index.php                         # Apache XAMPP Reverse Bridge & Port 3000 proxy router
├── package.json                      # NPM manifest
├── tailwind.config.ts                # Tailwind theme tokens & glassmorphic styling
├── tsconfig.json                     # TypeScript compiler options (strict, ES2022)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze-bloodwork/
│   │   │       └── route.ts          # Gemini 2.5 Vision clinical lab extraction endpoint
│   │   ├── globals.css               # Tactical scrollbars & glassmorphic styling
│   │   ├── layout.tsx                # HTML/body shell and metadata
│   │   └── page.tsx                  # Master Command Shell, tab switcher & ⌘K modal
│   ├── components/
│   │   ├── briefing/                 # Module E: Cross-System Executive Briefing
│   │   │   ├── BriefingBottlenecksColumn.tsx
│   │   │   ├── BriefingTelemetryColumn.tsx
│   │   │   ├── BriefingTimelineColumn.tsx
│   │   │   ├── ExecutiveBriefing.tsx
│   │   │   └── TelemetryCharts.tsx
│   │   ├── finance/                  # Module B: Financial & Budget Planner
│   │   │   ├── AIFinancialAdvisor.tsx
│   │   │   ├── FinanceCharts.tsx
│   │   │   ├── FinanceDashboard.tsx
│   │   │   ├── FinanceKpiCards.tsx
│   │   │   ├── mock-finance-data.ts
│   │   │   ├── TransactionAndBudgetManager.tsx
│   │   │   └── TransactionModal.tsx
│   │   ├── health/                   # Module C & D: Health, Wearable & Lab Hub
│   │   │   ├── BiometricReadinessHeader.tsx
│   │   │   ├── GymCardioPlanner.tsx
│   │   │   ├── GymCoachAndEquipment.tsx
│   │   │   ├── HealthDashboard.tsx
│   │   │   ├── MedicalReportAnalyzer.tsx
│   │   │   ├── MedicalSleepMonitor.tsx
│   │   │   ├── mock-health-data.ts
│   │   │   └── SmartNutritionPlanner.tsx
│   │   ├── mindmap/                  # Module A: Interactive Mind-Map & BOQ Engine
│   │   │   ├── BoardNavigationHeader.tsx
│   │   │   ├── CanvasHeaderHud.tsx
│   │   │   ├── CanvasToolbar.tsx
│   │   │   ├── CanvasToolDock.tsx
│   │   │   ├── CmsysSyncModal.tsx
│   │   │   ├── CustomTaskNode.tsx
│   │   │   ├── drawer-tabs/
│   │   │   ├── edges/
│   │   │   ├── FreehandCanvasOverlay.tsx
│   │   │   ├── ImageLightboxModal.tsx
│   │   │   ├── KeyboardShortcutsModal.tsx
│   │   │   ├── layout.ts
│   │   │   ├── LinkTaskModal.tsx
│   │   │   ├── MindMapCanvas.tsx
│   │   │   ├── MindMapToolbar.tsx
│   │   │   ├── MirrorTaskModal.tsx
│   │   │   ├── mock-civil-subtasks.ts
│   │   │   ├── mock-civil-tasks.ts
│   │   │   ├── mock-data.ts
│   │   │   ├── mock-multi-board.ts
│   │   │   ├── NodeFooterBadges.tsx
│   │   │   ├── NodeQuickActions.tsx
│   │   │   ├── progress-rollup.ts
│   │   │   ├── TaskDetailDrawer.tsx
│   │   │   ├── TaskSpaceBar.tsx
│   │   │   └── useCanvasHistory.ts
│   │   └── navigation/
│   │       ├── AppHeader.tsx
│   │       └── CommandPalette.tsx
│   ├── db/
│   │   └── schema.sql                 # PostgreSQL / Supabase DDL
│   ├── lib/
│   │   ├── ai/
│   │   ├── ai-service.ts
│   │   ├── firebase.ts
│   │   ├── google-workspace.ts
│   │   ├── integrations/
│   │   ├── schemas.ts
│   │   ├── supabase.ts
│   │   └── utils.ts
│   └── types/
│       ├── finance.ts
│       ├── health.ts
│       ├── mindmap.ts
│       └── nexus.ts
```

---

## 4. Getting Started

### Local Development
```bash
npm install
npm run dev
```

### Production Build & Verification
```bash
npm run typecheck    # Strict TypeScript verification (0 errors)
npm run build        # Production Next.js build
npm start            # Production runtime on http://0.0.0.0:3000
```
