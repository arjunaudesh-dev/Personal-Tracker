# Orbit — a universe of mind maps

A personal task tracker built around **profiles as universes**. Each profile is its own
mind-mapped task tree with its own roll-ups and budget lines, and any node in one universe
can be **bridged** to a node in another. The canvas can draw that structure as a mind map,
a network map, a concept map — or all three layered together.

> Built for the “Personal-Tracker / Mind-Map & BOQ & CAD” workspace: left-to-right task
> trees, leaf progress that rolls up through every parent, and BOQ lines that total into a
> universe budget.

---

## What you get

### 1. Multiple profiles = multiple universes

A **universe** is a profile: `Civil Works`, `Health & Vitality`, `Finance`,
`Personal Growth`, `Career Trajectory` ship as demos, and you can add as many as you like.

- **+ New universe** (header or the Universes rail) opens a profile builder: name, tagline,
  category, accent colour pair, glyph and the default graph system.
- Each universe owns its own tasks, roll-ups, currency and budget total.
- The **Universes** rail lists every profile with its progress ring data, BOQ, default
  system, and per-profile visibility (`eye` = show in orbit), edit and delete.
- Export / import the whole universe set as JSON; reset to the demo set at any time.
- Everything persists to `localStorage` (debounced), so a reload keeps your work.

### 2. Bridging universes (one-to-one, one-to-many)

Bridges are links between nodes — **including nodes that live in different universes**.

- Press **Link** in the toolbar (or `L`), then click a source node and a target node.
  A cross-universe bridge is highlighted with a toast.
- In a single-universe view, any bridge that leaves the universe appears as a **portal
  chip** on the right edge of the map. Click it to jump straight to the linked node in the
  other universe.
- While zoomed out in Orbit / Constellation, cross-universe bridges are routed
  **frame-to-frame** (universe to universe) so the macro shape of your life stays legible;
  zoom in and they resolve into the exact node-to-node connections. This is semantic zoom.
- Bridges carry a **relation kind** — relation, dependency, flow, reference, contrast —
  plus a label, strength (1–5) and a directed flag. Select a bridge on the canvas to edit
  it in the inspector.
- The **Universes rail** lists every bridge (cross-universe ones first) so you can jump to
  either endpoint or delete a connection in one click.

### 3. Graph systems you can change and combine

Four system modes, switchable at any time from **Systems** (or keys `1`–`4`):

| Mode | What it draws |
| --- | --- |
| **Mind** | Left-to-right hierarchy, rounded cards, swept branch curves, roll-up bars |
| **Network** | Pills with status cores, degree badges and link-weighted connections |
| **Concept** | Dashed proposition boxes with labelled, arrowed relationships |
| **Hybrid** | All three layered — and you can toggle each layer on/off |

In **Hybrid**, the layer chips (`Hierarchy`, `Network`, `Concepts`) let you combine the
systems yourself. Hybrid adds degree halos and network pills, keeps the mind-map spine, and
labels the propositions like a concept map.

**Per-profile systems** (Systems → `Per-profile systems`) goes a step further: in Orbit and
Constellation each universe is drawn in *its own* default system — so a mind map, a network
map and a concept map can appear side by side in a single canvas, all sharing the same
bridges and roll-ups.

Three independent layout engines:

- **Tidy tree** — classic LTR mind map, packed by subtree height
- **Radial** — branch sectors around the root with a soft overlap solver
- **Organic force** — spring/repulsion simulation with gravity, seeded deterministically

And four edge renderings: **curved**, **elbow**, **straight** and **arc**.

### 4. Scales of view

| Scope | Canvas |
| --- | --- |
| **Universe** | One profile, full depth, cross-universe portals on the right |
| **Orbit** | Every visible profile as a cluster orbiting the core, bridges frame-to-frame |
| **Constellation** | Profiles side by side for comparison |

The overview scopes never zoom below ~45%, so labels stay legible; a **minimap** (bottom
right, toggle with the grid button) shows where you are and lets you jump by clicking or
dragging. When you do zoom far out, cards collapse to status cores and fixed-size universe
chips take over, so the macro picture still carries tasks, progress and system per profile.

### 5. The rest of the workflow

- **Roll-ups**: a leaf owns its progress; every parent shows the mean of its children and
  a descendant count; universe progress is descendant-weighted.
- **BOQ**: `Budget line` per node in USD or LKR (indicative conversion, 1 USD = 302.4 LKR);
  parents and universes total their subtree values.
- **Inspector**: rename, status (todo / doing / done), progress slider (leaves only),
  budget line, notes, breadcrumb, structure counts, indent/outdent (re-parent with `Tab` /
  `Shift+Tab`) and every bridge touching the node.
- **Bridge picker**: *Connect to another node…* searches every task in every universe,
  flags cross-universe targets, and creates the bridge with the relation kind you choose —
  no canvas round-trip required.
- **Search** across titles and notes; matching branches auto-expand, `Enter` dives to the
  first visible match.
- **Undo / redo** (`⌘/Ctrl+Z`, `⇧⌘/Ctrl+Z`) across all structural edits.
- Keyboard: `N` child, `⇧N` root branch, `⌫` delete, `F` fit, `L` link mode, `Esc` exit,
  `/` search, `?` help.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:5173 (binds 0.0.0.0)
npm run build    # type-check + production bundle in dist/
npm run preview
```

React 18 + Vite 5 + TypeScript. No runtime dependencies beyond React — the layouts,
force simulation, geometry and interactions are all hand-written, and the graph is rendered
as positioned HTML cards over an SVG edge layer (crisp text at any zoom, no canvas blur).

---

## Tests

```bash
npm test           # both suites
npm run test:layout  # 531 geometry/model assertions, no browser
npm run test:ui      # 61 interaction checks in jsdom
```

`tests/layout-audit.ts` runs the planner over every scope × system × layout × (mixed or
not) combination and asserts finite coordinates, bounds containment, zero card/portal
overlaps, plus roll-up maths, collapse/search/hide visibility and the bridge model.

`tests/ui-smoke.mjs` bundles the real app with esbuild, mounts it in jsdom and drives the
UI: inspecting, renaming, indent/outdent, collapsing, switching systems and layers,
layouts, orbit/constellation, per-profile systems, minimap, canvas link mode, the bridge
picker, search, the universe rail, creating a universe, undo and currency.

## Architecture

```
src/
├─ types.ts                 domain types: Universe, MindNode, NodeLink, ViewSettings, GraphLayers…
├─ data/seed.ts             5 demo universes, tasks, cross-universe bridges
├─ tests/                   layout audit + jsdom UI smoke (npm test)
├─ store/store.tsx          reducer + undo/redo + debounced localStorage + per-universe system sync
├─ lib/
│  ├─ rollup.ts             forest build, descendant roll-ups, universe/aggregate stats
│  ├─ layout.ts             tidy tree / radial / organic, cluster packing (orbit, constellation),
│  │                        collapse-aware visibility, portals, semantic-zoom frames
│  ├─ layers.ts             system → layer presets
│  └─ utils.ts              currency, formatting, colour helpers
├─ graph/
│  ├─ geometry.ts           rectangle border anchors, bezier/elbow/arc paths, arrowheads
│  └─ useViewport.ts        pan / zoom / fit / focus animation, screen↔world math
└─ ui/
   ├─ App.tsx               shell, header, stats, shortcuts, orchestration
   ├─ Canvas.tsx            world, edges, groups, portals, LOD, gestures, link mode
   ├─ NodeCard.tsx          four visual systems in one card component
   ├─ Toolbar.tsx           search, scope, profile chips, systems + layer toggles, layouts
   ├─ Inspector.tsx         node + bridge editing
   ├─ UniverseRail.tsx      profile manager, bridge list, import/export
   ├─ UniverseModal.tsx     create/edit universe
   ├─ Minimap.tsx           viewport mini-map
   ├─ StatsStrip.tsx        roll-up KPI cards
   └─ Toasts.tsx            notices
```

### Data model (essentials)

```ts
Universe  { id, name, code, kind, tagline, accent, accent2, glyph, currency, system }
MindNode  { id, universeId, parentId, title, kind, status, progress, boq, collapsed, order }
NodeLink  { id, from, to, kind, label, strength, directed }   // from/to may be in different universes
```

Parent progress is never stored — it is derived in `computeMeta()` so a leaf edit
recalculates the whole branch, the universe KPI row and the BOQ total in one pass.

### Interaction model

- Pointer events on the canvas: drag = pan, pinch/wheel = zoom, double-click background =
  zoom in; double-click a card = fold the branch; chevron = fold/unfold.
- `transform` is a single `translate + scale` on `.world`; everything inside lays out in
  world coordinates, so zooming never re-flows the graph.
- Link mode is a two-click state machine (`click source → click target`); relation kind is
  picked in the floating banner.

---

## Notes & limits

- Currency conversion is a fixed indicative rate (`USD_LKR` in `src/lib/utils.ts`).
- Data is per-browser (no backend). Use **Export JSON** to move a universe set between
  machines.
- The demo set is restored with **Reset demo** in the Universes rail.
