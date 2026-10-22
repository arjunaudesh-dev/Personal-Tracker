/**
 * Layout & model audit — no browser required.
 *
 *   npm run test:layout
 *
 * Runs the planner across every scope × system × layout combination and asserts the
 * geometric invariants the canvas relies on, then checks the roll-up maths.
 */
import { seedLinks, seedNodes, seedUniverses } from '../src/data/seed';
import { planGraph } from '../src/lib/layout';
import { aggregateStats, computeMeta, universeStats } from '../src/lib/rollup';
import type { LayoutType, Scope, SystemType, ViewSettings } from '../src/types';

let failures = 0;
let checks = 0;

const check = (name: string, cond: boolean, extra = '') => {
  checks += 1;
  if (!cond) {
    failures += 1;
    console.log(`  ✗ ${name}${extra ? ` — ${extra}` : ''}`);
  }
};

const meta = computeMeta(seedNodes, seedLinks);
const scopes: Scope[] = ['universe', 'orbit', 'constellation'];
const systems: SystemType[] = ['mind', 'network', 'concept', 'hybrid'];
const layouts: LayoutType[] = ['tree', 'radial', 'organic'];

const baseView: ViewSettings = {
  scope: 'universe',
  universeId: 'u-civil',
  visibleUniverseIds: seedUniverses.map((u) => u.id),
  system: 'mind',
  layers: { hierarchy: true, network: false, concept: false },
  mixedSystems: false,
  layout: 'tree',
  edgeStyle: 'curve',
  showTreeEdges: true,
  showLinkLabels: true,
  currency: 'USD',
  search: '',
  selectedId: null,
  linkMode: false,
  hiddenIds: [],
  inspectorOpen: false,
};

/* ------------------------------------------------------------------ *
 *  1. geometry invariants
 * ------------------------------------------------------------------ */

console.log('\ngeometry');
for (const scope of scopes) {
  for (const system of systems) {
    for (const layout of layouts) {
      for (const mixedSystems of [false, true]) {
        const view: ViewSettings = {
          ...baseView,
          scope,
          universeId: scope === 'universe' ? 'u-civil' : null,
          system,
          layout,
          mixedSystems,
        };
        const plan = planGraph(seedUniverses, seedNodes, seedLinks, meta, view, {
          targetHeight: 560,
        });
        const tag = `${scope}/${system}/${layout}${mixedSystems ? '/mixed' : ''}`;

        check(`${tag} draws nodes`, plan.nodes.length > 0);
        check(
          `${tag} finite coordinates`,
          plan.nodes.every((n) => Number.isFinite(n.x) && Number.isFinite(n.y)),
        );
        check(`${tag} positive bounds`, plan.bounds.w > 0 && plan.bounds.h > 0);
        check(
          `${tag} cards inside bounds`,
          plan.nodes.every(
            (n) =>
              n.x >= -1 &&
              n.y >= -1 &&
              n.x + n.w <= plan.bounds.w + 1 &&
              n.y + n.h <= plan.bounds.h + 1,
          ),
          `right=${Math.round(Math.max(...plan.nodes.map((n) => n.x + n.w)))} / ${plan.bounds.w}`,
        );
        check(
          `${tag} portals inside bounds`,
          plan.portals.every(
            (p) => p.x + p.w <= plan.bounds.w + 1 && p.y + p.h <= plan.bounds.h + 1,
          ),
        );

        let overlaps = 0;
        for (let i = 0; i < plan.nodes.length; i++) {
          for (let j = i + 1; j < plan.nodes.length; j++) {
            const a = plan.nodes[i];
            const b = plan.nodes[j];
            if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
              overlaps += 1;
            }
          }
        }
        check(`${tag} no card overlap`, overlaps === 0, `${overlaps} overlaps`);

        let portalHits = 0;
        for (const portal of plan.portals) {
          for (const n of plan.nodes) {
            if (
              portal.x < n.x + n.w &&
              portal.x + portal.w > n.x &&
              portal.y < n.y + n.h &&
              portal.y + portal.h > n.y
            ) {
              portalHits += 1;
            }
          }
        }
        check(`${tag} portals clear of cards`, portalHits === 0, `${portalHits} hits`);
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 *  2. density knob (stage height) stays sane
 * ------------------------------------------------------------------ */

console.log('density');
for (const targetHeight of [320, 420, 560, 720, 900]) {
  const plan = planGraph(
    seedUniverses,
    seedNodes,
    seedLinks,
    meta,
    { ...baseView, scope: 'universe' },
    { targetHeight },
  );
  check(`target ${targetHeight} finite`, Number.isFinite(plan.bounds.w) && Number.isFinite(plan.bounds.h));
  check(`target ${targetHeight} keeps all cards`, plan.nodes.length === 20, `${plan.nodes.length}`);
}

/* ------------------------------------------------------------------ *
 *  3. roll-ups
 * ------------------------------------------------------------------ */

console.log('roll-ups');
const civil = seedUniverses.find((u) => u.id === 'u-civil')!;
const civilStats = universeStats(civil, seedNodes, meta);
check('civil tasks', civilStats.nodes === 20, String(civilStats.nodes));
check('civil done', civilStats.done === 2, String(civilStats.done));
check('civil progress in range', civilStats.progress > 0 && civilStats.progress < 100);

const root = seedNodes.find((n) => n.universeId === 'u-civil' && !n.parentId)!;
const rootMeta = meta.get(root.id)!;
check('root progress = mean of branches', Math.abs(rootMeta.progress - 23.3) < 1.2, String(rootMeta.progress));
check('root boq = subtree total', Math.abs(rootMeta.boq - 6818) < 1, String(rootMeta.boq));
check('root descendants', rootMeta.descendants === 19, String(rootMeta.descendants));

const agg = aggregateStats(seedUniverses, seedNodes, meta);
check('aggregate task count', agg.nodes === seedNodes.length, `${agg.nodes}/${seedNodes.length}`);
check('aggregate boq >= civil boq', agg.boq >= civilStats.boq);

/* ------------------------------------------------------------------ *
 *  4. visibility: collapse, search, hidden
 * ------------------------------------------------------------------ */

console.log('visibility');
const collapseTarget = seedNodes.find((n) => n.title === 'Land Acquisition')!;
const collapsedPlan = planGraph(
  seedUniverses,
  seedNodes.map((n) => (n.id === collapseTarget.id ? { ...n, collapsed: true } : n)),
  seedLinks,
  meta,
  { ...baseView, scope: 'universe' },
  { targetHeight: 560 },
);
check(
  'collapse hides descendants',
  !collapsedPlan.nodes.some((n) => n.node.parentId === collapseTarget.id),
  `${collapsedPlan.nodes.length} visible`,
);

const searchPlan = planGraph(
  seedUniverses,
  seedNodes,
  seedLinks,
  meta,
  { ...baseView, scope: 'orbit', universeId: null, search: 'foundation' },
  { targetHeight: 560 },
);
check(
  'search expands hidden branch',
  searchPlan.nodes.some((n) => n.node.title.includes('Foundation')),
);

const hiddenPlan = planGraph(
  seedUniverses,
  seedNodes,
  seedLinks,
  meta,
  { ...baseView, scope: 'orbit', universeId: null, hiddenIds: [collapseTarget.id] },
  { targetHeight: 560 },
);
check('hidden subtree removed', !hiddenPlan.nodes.some((n) => n.node.id === collapseTarget.id));

/* ------------------------------------------------------------------ *
 *  5. bridging model
 * ------------------------------------------------------------------ */

console.log('bridges');
const universeOf = new Map(seedNodes.map((n) => [n.id, n.universeId]));
const cross = seedLinks.filter((l) => universeOf.get(l.from) !== universeOf.get(l.to));
check('seed crosses universes', cross.length > 0, `${cross.length} cross-universe`);

const portalPlan = planGraph(seedUniverses, seedNodes, seedLinks, meta, baseView, {
  targetHeight: 560,
});
check('single universe exposes portals', portalPlan.portals.length > 0, `${portalPlan.portals.length}`);
check(
  'portals point at other universes',
  portalPlan.portals.every((p) => p.universe.id !== 'u-civil'),
);

const orbitPlan = planGraph(
  seedUniverses,
  seedNodes,
  seedLinks,
  meta,
  { ...baseView, scope: 'orbit', universeId: null },
  { targetHeight: 560 },
);
check('orbit has no portals (bridges are direct)', orbitPlan.portals.length === 0);
check('orbit renders every universe', orbitPlan.groups.length === seedUniverses.length);
check('orbit has a hub', !!orbitPlan.hub);

console.log(
  failures === 0
    ? `\n✓ layout audit passed — ${checks} checks\n`
    : `\n✗ layout audit failed — ${failures}/${checks} checks\n`,
);
process.exit(failures === 0 ? 0 : 1);
