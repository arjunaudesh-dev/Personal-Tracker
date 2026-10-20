import type {
  GroupBox,
  MindNode,
  NodeLink,
  NodeMeta,
  Rect,
  Universe,
  UniverseStats,
  ViewSettings,
} from '../types';
import { buildForest, universeStats } from './rollup';

export interface PortalNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  universe: Universe;
  node: MindNode;
  link: NodeLink;
  direction: 'out' | 'in';
}

export interface PlannedGraph {
  nodes: import('../types').PlannedNode[];
  groups: GroupBox[];
  portals: PortalNode[];
  bounds: Rect;
  hub: { x: number; y: number } | null;
  visibleIds: Set<string>;
}

export const NODE_SIZE = {
  root: { w: 186, h: 66 },
  branch: { w: 158, h: 58 },
  task: { w: 142, h: 54 },
} as const;

const H_GAP = 54;
const V_GAP = 10;
const CLUSTER_PAD = 30;

const sizeOf = (n: MindNode) => NODE_SIZE[n.kind];

interface Cluster {
  universe: Universe;
  nodes: import('../types').PlannedNode[];
  local: Rect;
  stats: UniverseStats;
}

const descendantsVisible = (nodes: MindNode[], linkMap: Map<string, MindNode[]>) => {
  // noop placeholder kept for clarity
  return linkMap;
};

/** visible nodes for a universe, honouring collapse — but auto-expanding search hits */
const collectVisible = (
  universeId: string,
  nodes: MindNode[],
  childrenOf: Map<string, MindNode[]>,
  expanded: Set<string>,
): MindNode[] => {
  const out: MindNode[] = [];
  const roots = nodes
    .filter((n) => n.universeId === universeId && !n.parentId)
    .sort((a, b) => a.order - b.order);
  const walk = (node: MindNode) => {
    out.push(node);
    if (node.collapsed && !expanded.has(node.id)) return;
    const kids = childrenOf.get(node.id) ?? [];
    for (const k of kids) walk(k);
  };
  roots.forEach(walk);
  return out;
};

/** visible nodes capped at `maxDepth` — used for compact orbit overviews */
const collectVisibleCapped = (
  universeId: string,
  nodes: MindNode[],
  childrenOf: Map<string, MindNode[]>,
  expanded: Set<string>,
  maxDepth: number,
): MindNode[] => {
  const out: MindNode[] = [];
  const roots = nodes
    .filter((n) => n.universeId === universeId && !n.parentId)
    .sort((a, b) => a.order - b.order);
  const walk = (node: MindNode, depth: number) => {
    if (depth > maxDepth) return;
    out.push(node);
    if (node.collapsed && !expanded.has(node.id)) return;
    for (const k of childrenOf.get(node.id) ?? []) walk(k, depth + 1);
  };
  roots.forEach((r) => walk(r, 0));
  return out;
};

const findExpandedForSearch = (
  nodes: MindNode[],
  query: string,
): { expanded: Set<string>; matches: Set<string> } => {
  const matches = new Set<string>();
  const expanded = new Set<string>();
  if (!query.trim()) return { expanded, matches };
  const q = query.trim().toLowerCase();
  const byId = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) {
    if (n.title.toLowerCase().includes(q)) {
      matches.add(n.id);
      let cur = n;
      let guard = 0;
      while (cur.parentId && guard++ < 100) {
        expanded.add(cur.parentId);
        const parent = byId.get(cur.parentId);
        if (!parent) break;
        cur = parent;
      }
    }
  }
  // also match notes
  for (const n of nodes) {
    if (n.notes && n.notes.toLowerCase().includes(q)) matches.add(n.id);
  }
  return { expanded, matches };
};

/* ------------------------------------------------------------------ *
 *  Layout algorithms (produce centres in local space)
 * ------------------------------------------------------------------ */

/**
 * Tidy LTR tree with height-banded packing.
 *
 * A pure single-column tree grows very tall; when a root's children exceed
 * `targetHeight` they are split into contiguous bands that flow left-to-right
 * side by side (still read as one tree, just wrapped). This keeps the whole map
 * visible at a readable zoom on a laptop screen.
 */
const treeLayout = (
  visible: MindNode[],
  kidsOf: (id: string) => MindNode[],
  targetHeight = 620,
) => {
  const positions = new Map<string, { x: number; y: number; cx: number; cy: number }>();

  interface Measured {
    h: number;
    w: number;
  }
  const memo = new Map<string, Measured>();

  const measure = (n: MindNode): Measured => {
    const cached = memo.get(n.id);
    if (cached) return cached;
    const s = sizeOf(n);
    const kids = n.collapsed ? [] : kidsOf(n.id);
    let result: Measured;
    if (!kids.length) {
      result = { h: s.h, w: s.w };
    } else {
      const ms = kids.map(measure);
      const totalH = ms.reduce((sum, m) => sum + m.h, 0) + V_GAP * (kids.length - 1);
      const childW = Math.max(...ms.map((m) => m.w));
      result = { h: Math.max(s.h, totalH), w: s.w + H_GAP + childW };
    }
    memo.set(n.id, result);
    return result;
  };

  /** split a child list into `bands` contiguous groups with balanced height */
  const partition = (kids: MindNode[], bands: number): MindNode[][] => {
    if (bands <= 1) return [kids];
    const heights = kids.map((k) => measure(k).h);
    const total = heights.reduce((a, b) => a + b, 0) + V_GAP * (kids.length - 1);
    const out: MindNode[][] = [];
    let i = 0;
    let remaining = total;
    let remainingBands = bands;
    while (i < kids.length && remainingBands > 0) {
      const target = remaining / remainingBands;
      const band: MindNode[] = [];
      let acc = 0;
      while (i < kids.length) {
        // always leave one child for each remaining band
        if (kids.length - i <= remainingBands - 1) break;
        const next = heights[i] + (band.length ? V_GAP : 0);
        if (band.length && acc + next > target * 1.06) break;
        band.push(kids[i]);
        acc += next;
        remaining -= next;
        i += 1;
      }
      out.push(band);
      remainingBands -= 1;
    }
    if (i < kids.length && out.length) out[out.length - 1].push(...kids.slice(i));
    return out;
  };

  /** place a node and its single-column descendants */
  const placeColumn = (n: MindNode, x: number, top: number): number => {
    const s = sizeOf(n);
    const kids = n.collapsed ? [] : kidsOf(n.id);
    const blockH = kids.length
      ? kids.reduce((sum, k) => sum + measure(k).h, 0) + V_GAP * (kids.length - 1)
      : s.h;
    const cy = top + blockH / 2;
    positions.set(n.id, { x, y: cy - s.h / 2, cx: x + s.w / 2, cy });
    if (!kids.length) return blockH;
    let cur = top;
    for (const k of kids) {
      placeColumn(k, x + s.w + H_GAP, cur);
      cur += measure(k).h + V_GAP;
    }
    return blockH;
  };

  const roots = visible.filter((n) => !n.parentId);
  let rootTop = 0;

  for (const root of roots) {
    const rs = sizeOf(root);
    const kids = root.collapsed ? [] : kidsOf(root.id);
    if (!kids.length) {
      positions.set(root.id, { x: 0, y: rootTop, cx: rs.w / 2, cy: rootTop + rs.h / 2 });
      rootTop += rs.h + 72;
      continue;
    }

    const heights = kids.map((k) => measure(k).h);
    const singleH = heights.reduce((a, b) => a + b, 0) + V_GAP * (kids.length - 1);
    const bandCount = Math.max(1, Math.min(kids.length, Math.ceil(singleH / targetHeight)));
    const bands = partition(kids, bandCount);

    // horizontal offset of each band, measured from the root's right edge
    const bandWidths = bands.map((b) => Math.max(...b.map((k) => measure(k).w)));
    const bandX: number[] = [];
    let acc = rs.w + H_GAP;
    for (const w of bandWidths) {
      bandX.push(acc);
      acc += w + H_GAP;
    }

    const bandHeights = bands.map(
      (b) => b.reduce((sum, k) => sum + measure(k).h, 0) + V_GAP * (b.length - 1),
    );
    const blockH = Math.max(...bandHeights, rs.h);
    const cy = rootTop + blockH / 2;
    positions.set(root.id, { x: 0, y: cy - rs.h / 2, cx: rs.w / 2, cy });

    bands.forEach((band, bi) => {
      const bandTop = cy - bandHeights[bi] / 2;
      let cur = bandTop;
      for (const k of band) {
        placeColumn(k, bandX[bi], cur);
        cur += measure(k).h + V_GAP;
      }
    });

    rootTop += blockH + 96;
  }

  return positions;
};

interface LayoutPoint {
  id: string;
  cx: number;
  cy: number;
  s: { w: number; h: number };
}

/** deterministic pairwise separation — runs until no card overlaps remain */
const resolveAllOverlaps = (arr: LayoutPoint[], maxIter = 160): void => {
  for (let iter = 0; iter < maxIter; iter++) {
    let moved = false;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i];
        const b = arr[j];
        const padX = (a.s.w + b.s.w) / 2 + 18;
        const padY = (a.s.h + b.s.h) / 2 + 14;
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const overlapX = padX - Math.abs(dx);
        const overlapY = padY - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          moved = true;
          const sx = Math.sign(dx) || (i % 2 === 0 ? 1 : -1);
          const sy = Math.sign(dy) || 1;
          if (overlapX < overlapY) {
            const push = overlapX / 2 + 0.5;
            a.cx -= sx * push;
            b.cx += sx * push;
          } else {
            const push = overlapY / 2 + 0.5;
            a.cy -= sy * push;
            b.cy += sy * push;
          }
        }
      }
    }
    if (!moved) return;
  }
};

const radialLayout = (
  visible: MindNode[],
  kidsOf: (id: string) => MindNode[],
  links: NodeLink[],
) => {
  const positions = new Map<string, { x: number; y: number; cx: number; cy: number }>();
  const roots = visible.filter((n) => !n.parentId);
  if (!roots.length) return positions;

  const countLeaves = (n: MindNode): number => {
    const kids = n.collapsed ? [] : kidsOf(n.id);
    if (!kids.length) return 1;
    return kids.reduce((s, k) => s + countLeaves(k), 0);
  };

  const levelRadius: number[] = [];
  const maxLevel = 6;
  const baseStep = 360;
  for (let i = 0; i <= maxLevel; i++) levelRadius[i] = 190 + i * baseStep;

  let vIndex = 0;
  const place = (n: MindNode, depth: number, a0: number, a1: number, cx: number, cy: number) => {
    const s = sizeOf(n);
    const r = depth === 0 ? 0 : levelRadius[depth];
    const mid = (a0 + a1) / 2;
    const px = cx + Math.cos(mid) * r;
    const py = cy + Math.sin(mid) * r;
    positions.set(n.id, { x: px - s.w / 2, y: py - s.h / 2, cx: px, cy: py });
    vIndex += 1;
    const kids = n.collapsed ? [] : kidsOf(n.id);
    if (!kids.length) return;
    const leaves = kids.map(countLeaves);
    const total = leaves.reduce((a, b) => a + b, 0) || 1;
    // keep the slice but open it up a little when the parent is a single branch
    let start = a0;
    kids.forEach((k, i) => {
      const span = ((a1 - a0) * leaves[i]) / total;
      place(k, depth + 1, start, start + span, cx, cy);
      start += span;
    });
  };

  const rootSpacing = 1300;
  roots.forEach((root, i) => {
    // leave angular room proportional to the branch size
    const leaves = countLeaves(root);
    const totalLeaves = roots.reduce((s, r) => s + countLeaves(r), 0) || 1;
    const slice = (Math.PI * 2 * leaves) / totalLeaves;
    const start = -Math.PI / 2 + (Math.PI * 2 * i) / roots.length;
    void slice;
    place(root, 0, start, start + Math.PI * 2, 0, i * rootSpacing);
  });

  // expand rings that are too tight for the cards sitting on them
  const byDepth = new Map<number, number[]>();
  const depthMap = new Map<string, number>();
  const markDepth = (n: MindNode, d: number) => {
    depthMap.set(n.id, d);
    const kids = n.collapsed ? [] : kidsOf(n.id);
    for (const k of kids) markDepth(k, d + 1);
  };
  roots.forEach((r) => markDepth(r, 0));
  for (const n of visible) {
    const d = depthMap.get(n.id) ?? 0;
    const arr = byDepth.get(d) ?? [];
    arr.push(d);
    byDepth.set(d, arr);
  }

  // resolve overlaps with a few gentle iterations
  const arr = visible.map((n) => ({
    id: n.id,
    ...positions.get(n.id)!,
    s: sizeOf(n),
  }));
  for (let iter = 0; iter < 90; iter++) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i];
        const b = arr[j];
        const padX = (a.s.w + b.s.w) / 2 + 22;
        const padY = (a.s.h + b.s.h) / 2 + 16;
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const overlapX = padX - Math.abs(dx);
        const overlapY = padY - Math.abs(dy);
        if (overlapX > 0 && overlapY > 0) {
          const push = Math.min(overlapX, overlapY) / 2 + 2;
          const sx = Math.sign(dx) || (i % 2 ? 1 : -1);
          const sy = Math.sign(dy) || 1;
          if (overlapX < overlapY) {
            a.cx -= sx * push;
            b.cx += sx * push;
          } else {
            a.cy -= sy * push;
            b.cy += sy * push;
          }
        }
      }
    }
  }
  resolveAllOverlaps(arr, 160);
  for (const a of arr) {
    positions.set(a.id, { x: a.cx - a.s.w / 2, y: a.cy - a.s.h / 2, cx: a.cx, cy: a.cy });
  }
  void links;
  return positions;
};

const organicLayout = (
  visible: MindNode[],
  kidsOf: (id: string) => MindNode[],
  links: NodeLink[],
) => {
  const positions = new Map<string, { x: number; y: number; cx: number; cy: number }>();
  const roots = visible.filter((n) => !n.parentId);
  if (!roots.length) return positions;

  // deterministic seeding on a circle, branches fanned out
  const n = visible.length;
  const index = new Map(visible.map((node, i) => [node.id, i]));
  const pts = visible.map((node) => {
    const i = index.get(node.id)!;
    const depth = (() => {
      let d = 0;
      let cur: MindNode | undefined = node;
      while (cur?.parentId) {
        cur = visible.find((x) => x.id === cur!.parentId);
        d += 1;
        if (!cur) break;
      }
      return d;
    })();
    const angle = (i / Math.max(1, n)) * Math.PI * 2 + depth * 0.35;
    const radius = 170 + depth * 300 + ((i * 37) % 60);
    return {
      id: node.id,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      vx: 0,
      vy: 0,
      s: sizeOf(node),
    };
  });
  const map = new Map(pts.map((p) => [p.id, p]));

  const edges: Array<[string, string, number]> = [];
  const walk = (node: MindNode) => {
    if (node.collapsed) return;
    for (const k of kidsOf(node.id)) {
      edges.push([node.id, k.id, 250]);
      walk(k);
    }
  };
  roots.forEach(walk);
  const visibleSet = new Set(visible.map((v) => v.id));
  for (const l of links) {
    if (visibleSet.has(l.from) && visibleSet.has(l.to)) {
      edges.push([l.from, l.to, 360 + (5 - l.strength) * 20]);
    }
  }

  const iterations = n > 55 ? 170 : 260;
  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;
    // repulsion
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i];
        const b = pts[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = (i - j) || 1;
          dy = 1;
          d2 = 2;
        }
        const d = Math.sqrt(d2);
        const minDist = (a.s.w + b.s.w) / 2 + 40;
        const force = (minDist * minDist * 0.9) / d2;
        const fx = (dx / d) * force * alpha;
        const fy = (dy / d) * force * alpha;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }
    // springs
    for (const [a, b, len] of edges) {
      const pa = map.get(a);
      const pb = map.get(b);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const d = Math.hypot(dx, dy) || 1;
      const diff = (d - len) / d / 2;
      const fx = dx * diff * 0.06 * alpha;
      const fy = dy * diff * 0.06 * alpha;
      pa.vx += fx;
      pa.vy += fy;
      pb.vx -= fx;
      pb.vy -= fy;
    }
    // gravity keeps clusters compact
    for (const p of pts) {
      p.vx += -p.x * 0.0022 * alpha;
      p.vy += -p.y * 0.0022 * alpha;
      p.x += Math.max(-40, Math.min(40, p.vx));
      p.y += Math.max(-40, Math.min(40, p.vy));
      p.vx *= 0.72;
      p.vy *= 0.72;
    }
  }

  const organicPts: LayoutPoint[] = pts.map((p) => ({
    id: p.id,
    cx: p.x,
    cy: p.y,
    s: p.s,
  }));
  resolveAllOverlaps(organicPts, 200);
  for (const p of organicPts) {
    positions.set(p.id, {
      x: p.cx - p.s.w / 2,
      y: p.cy - p.s.h / 2,
      cx: p.cx,
      cy: p.cy,
    });
  }
  return positions;
};

/* ------------------------------------------------------------------ *
 *  Main planner
 * ------------------------------------------------------------------ */

export const planGraph = (
  universes: Universe[],
  allNodes: MindNode[],
  links: NodeLink[],
  meta: Map<string, NodeMeta>,
  view: ViewSettings,
  opts: { targetHeight?: number } = {},
): PlannedGraph => {
  const { expanded, matches } = findExpandedForSearch(allNodes, view.search);
  const forest = buildForest(allNodes);
  const hidden = new Set(view.hiddenIds);
  const hideSubtree = (id: string) => {
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop()!;
      hidden.add(cur);
      for (const k of forest.childrenOf.get(cur) ?? []) stack.push(k.id);
    }
  };
  for (const id of view.hiddenIds) hideSubtree(id);
  void descendantsVisible;

  const shownUniverses =
    view.scope === 'universe'
      ? universes.filter((u) => u.id === view.universeId)
      : universes.filter((u) => view.visibleUniverseIds.includes(u.id));

  const clusters: Cluster[] = [];

  const depthCap =
    view.scope === 'universe' || view.search.trim() ? Number.POSITIVE_INFINITY : 1;

  for (const universe of shownUniverses) {
    const visibleAll = Number.isFinite(depthCap)
      ? collectVisibleCapped(universe.id, allNodes, forest.childrenOf, expanded, depthCap)
      : collectVisible(universe.id, allNodes, forest.childrenOf, expanded);
    const visible = visibleAll.filter((n) => !hidden.has(n.id));
    if (!visible.length) {
      clusters.push({
        universe,
        nodes: [],
        local: { x: 0, y: 0, w: 300, h: 200 },
        stats: universeStats(universe, allNodes, meta),
      });
      continue;
    }

    const visibleSet = new Set(visible.map((n) => n.id));
    const kidsOf = (id: string) =>
      (forest.childrenOf.get(id) ?? []).filter((k) => visibleSet.has(k.id));

    let positions: Map<string, { x: number; y: number; cx: number; cy: number }>;
    if (view.layout === 'radial') {
      positions = radialLayout(visible, kidsOf, links);
    } else if (view.layout === 'organic') {
      positions = organicLayout(visible, kidsOf, links);
    } else {
      positions = treeLayout(visible, kidsOf, opts.targetHeight);
    }

    const planned: import('../types').PlannedNode[] = visible.map((node) => {
      const s = sizeOf(node);
      const p = positions.get(node.id) ?? { x: 0, y: 0, cx: 0, cy: 0 };
      const depth = (() => {
        let d = 0;
        let cur: MindNode | undefined = node;
        while (cur.parentId) {
          cur = forest.byId.get(cur.parentId);
          d += 1;
          if (!cur) break;
        }
        return d;
      })();
      return {
        node,
        universe,
        meta: meta.get(node.id) ?? {
          children: 0,
          descendants: 0,
          doneCount: 0,
          progress: node.progress,
          boq: node.boq,
          degree: 0,
        },
        depth,
        x: p.x,
        y: p.y,
        w: s.w,
        h: s.h,
      };
    });

    const minX = Math.min(...planned.map((p) => p.x));
    const minY = Math.min(...planned.map((p) => p.y));
    const maxX = Math.max(...planned.map((p) => p.x + p.w));
    const maxY = Math.max(...planned.map((p) => p.y + p.h));
    const norm = planned.map((p) => ({ ...p, x: p.x - minX, y: p.y - minY }));
    // round up so fractional coordinates can never spill past the declared cluster box
    const localW = Math.ceil(maxX - minX) + 2;
    const localH = Math.ceil(maxY - minY) + 2;
    clusters.push({
      universe,
      nodes: norm,
      local: { x: 0, y: 0, w: localW, h: localH },
      stats: universeStats(universe, allNodes, meta),
    });
  }

  /* ---- place clusters in world space ---- */
  const placed: import('../types').PlannedNode[] = [];
  const groups: GroupBox[] = [];
  let hub: { x: number; y: number } | null = null;

  if (view.scope === 'universe') {
    const c = clusters[0];
    if (c) {
      const offsetX = 0;
      const offsetY = 0;
      for (const p of c.nodes) placed.push({ ...p, x: p.x + offsetX, y: p.y + offsetY });
      groups.push({
        universe: c.universe,
        x: offsetX - CLUSTER_PAD,
        y: offsetY - CLUSTER_PAD,
        w: c.local.w + CLUSTER_PAD * 2,
        h: c.local.h + CLUSTER_PAD * 2,
        cx: c.local.w / 2 + offsetX,
        cy: c.local.h / 2 + offsetY,
        stats: c.stats,
      });
    }
  } else if (view.scope === 'orbit') {
    const n = clusters.length || 1;
    const maxW = Math.max(...clusters.map((c) => c.local.w), 360);
    const maxH = Math.max(...clusters.map((c) => c.local.h), 240);
    const rx = Math.max(720, maxW * 0.5 + 300);
    const ry = Math.max(300, maxH * 0.5 + 130);

    // 1. seed on an ellipse (starting left so the first universe reads first)
    const centers = clusters.map((c, i) => {
      const angle = Math.PI + (i / n) * Math.PI * 2;
      let px = Math.cos(angle) * rx;
      let py = Math.sin(angle) * ry;
      // 2. push each cluster out until its frame clears the core ring
      const halfW = c.local.w / 2 + CLUSTER_PAD;
      const halfH = c.local.h / 2 + CLUSTER_PAD;
      const coreR = 215;
      for (let k = 0; k < 8; k++) {
        const nearX = Math.max(Math.abs(px) - halfW, 0);
        const nearY = Math.max(Math.abs(py) - halfH, 0);
        const dist = Math.hypot(nearX, nearY);
        if (dist >= coreR) break;
        const push = coreR - dist + 20;
        const len = Math.hypot(px, py) || 1;
        px += (px / len) * push;
        py += (py / len) * push;
      }
      return { px, py };
    });

    // 3. separate overlapping cluster frames (radially, so the orbit shape survives)
    for (let iter = 0; iter < 80; iter++) {
      let moved = false;
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
          const a = centers[i];
          const b = centers[j];
          const halfAW = clusters[i].local.w / 2 + CLUSTER_PAD;
          const halfAH = clusters[i].local.h / 2 + CLUSTER_PAD;
          const halfBW = clusters[j].local.w / 2 + CLUSTER_PAD;
          const halfBH = clusters[j].local.h / 2 + CLUSTER_PAD;
          const overlapX = halfAW + halfBW + 26 - Math.abs(b.px - a.px);
          const overlapY = halfAH + halfBH + 26 - Math.abs(b.py - a.py);
          if (overlapX > 0 && overlapY > 0) {
            moved = true;
            const axisX = overlapX < overlapY;
            const push = (axisX ? overlapX : overlapY) / 2 + 1;
            const sx = Math.sign(b.px - a.px) || 1;
            const sy = Math.sign(b.py - a.py) || 1;
            if (axisX) {
              a.px -= sx * push;
              b.px += sx * push;
            } else {
              a.py -= sy * push;
              b.py += sy * push;
            }
          }
        }
      }
      if (!moved) break;
    }

    clusters.forEach((c, i) => {
      const { px, py } = centers[i];
      const ox = px - c.local.w / 2;
      const oy = py - c.local.h / 2;
      for (const p of c.nodes) placed.push({ ...p, x: p.x + ox, y: p.y + oy });
      groups.push({
        universe: c.universe,
        x: ox - CLUSTER_PAD,
        y: oy - CLUSTER_PAD,
        w: c.local.w + CLUSTER_PAD * 2,
        h: c.local.h + CLUSTER_PAD * 2,
        cx: px,
        cy: py,
        stats: c.stats,
      });
    });
    hub = { x: 0, y: 0 };
  } else {
    // constellation grid
    const cols = clusters.length <= 2 ? clusters.length || 1 : clusters.length <= 4 ? 2 : 3;
    const cellW = Math.max(...clusters.map((c) => c.local.w), 320) + 150;
    const cellH = Math.max(...clusters.map((c) => c.local.h), 240) + 170;
    const rows = Math.ceil(clusters.length / cols);
    clusters.forEach((c, i) => {
      const r = Math.floor(i / cols);
      const col = i % cols;
      const rowCount = Math.min(cols, clusters.length - r * cols);
      const rowWidth = rowCount * cellW;
      const ox = Math.round(col * cellW - rowWidth / 2 + (cellW - c.local.w) / 2);
      const oy = Math.round(r * cellH - (rows * cellH) / 2 + (cellH - c.local.h) / 2);
      for (const p of c.nodes) placed.push({ ...p, x: p.x + ox, y: p.y + oy });
      groups.push({
        universe: c.universe,
        x: ox - CLUSTER_PAD,
        y: oy - CLUSTER_PAD,
        w: c.local.w + CLUSTER_PAD * 2,
        h: c.local.h + CLUSTER_PAD * 2,
        cx: c.local.w / 2 + ox,
        cy: c.local.h / 2 + oy,
        stats: c.stats,
      });
    });
  }

  /* ---- portals: cross-universe links while inside one universe ---- */
  // built in the clusters' already-placed space (before the shift below)
  const portals: PortalNode[] = [];
  if (view.scope === 'universe' && view.universeId) {
    const visibleIds = new Set(placed.map((p) => p.node.id));
    const byId = new Map(allNodes.map((n) => [n.id, n]));
    const external = links.filter((l) => visibleIds.has(l.from) !== visibleIds.has(l.to));
    const innerY = (link: NodeLink) => {
      const inner = byId.get(visibleIds.has(link.from) ? link.from : link.to);
      return placed.find((p) => p.node.id === inner?.id)?.y ?? 0;
    };
    const sorted = [...external].sort((a, b) => innerY(a) - innerY(b));

    const cardMaxX = Math.max(...placed.map((p) => p.x + p.w), 300);
    const cardMinY = Math.min(...placed.map((p) => p.y), 0);
    const cardMaxY = Math.max(...placed.map((p) => p.y + p.h), 500);
    const total = sorted.length;
    const spanTop = cardMinY + 10;
    const spanBottom = Math.max(cardMaxY - 58, spanTop);
    const step = total > 1 ? (spanBottom - spanTop) / (total - 1) : 0;

    sorted.forEach((link, i) => {
      const insideIsFrom = visibleIds.has(link.from);
      const outerId = insideIsFrom ? link.to : link.from;
      const outerNode = byId.get(outerId);
      const outerUniverse = universes.find((u) => u.id === outerNode?.universeId);
      if (!outerNode || !outerUniverse) return;
      portals.push({
        id: `portal-${link.id}`,
        x: cardMaxX + 78,
        y: Math.min(spanTop + step * i, spanBottom),
        w: 194,
        h: 46,
        universe: outerUniverse,
        node: outerNode,
        link,
        direction: insideIsFrom ? 'out' : 'in',
      });
    });
  }

  /* ---- bounds + shift to positive space ---- */
  const rectList: Rect[] = [
    ...placed.map((p) => ({ x: p.x, y: p.y, w: p.w, h: p.h })),
    ...groups.map((g) => ({ x: g.x, y: g.y, w: g.w, h: g.h })),
    ...portals.map((t) => ({ x: t.x, y: t.y, w: t.w, h: t.h })),
  ];
  if (hub) {
    rectList.push({ x: hub.x - 200, y: hub.y - 200, w: 400, h: 400 });
  }
  // keep min/max as real numbers (Infinity sentinels would poison the Math.max call)
  const xs0 = rectList.map((r) => r.x);
  const ys0 = rectList.map((r) => r.y);
  const xs1 = rectList.map((r) => r.x + r.w);
  const ys1 = rectList.map((r) => r.y + r.h);
  const minX = xs0.length ? Math.min(...xs0) : 0;
  const minY = ys0.length ? Math.min(...ys0) : 0;
  const maxX = xs1.length ? Math.max(...xs1) : 900;
  const maxY = ys1.length ? Math.max(...ys1) : 700;

  const WORLD_PAD = 120;
  const shiftX = Number.isFinite(minX) ? -minX + WORLD_PAD : 0;
  const shiftY = Number.isFinite(minY) ? -minY + WORLD_PAD : 0;
  for (const p of placed) {
    p.x += shiftX;
    p.y += shiftY;
  }
  for (const g of groups) {
    g.x += shiftX;
    g.y += shiftY;
    g.cx += shiftX;
    g.cy += shiftY;
  }
  if (hub) {
    hub.x += shiftX;
    hub.y += shiftY;
  }

  // world content now starts at WORLD_PAD, so the box must include the padding on both sides
  const bounds: Rect = {
    x: 0,
    y: 0,
    w: Math.ceil(maxX - minX) + WORLD_PAD * 2,
    h: Math.ceil(maxY - minY) + WORLD_PAD * 2,
  };

  // shift portals together with the world
  for (const t of portals) {
    t.x += shiftX;
    t.y += shiftY;
  }

  return {
    nodes: placed,
    groups,
    portals,
    bounds,
    hub,
    visibleIds: new Set(placed.map((p) => p.node.id)),
  };
};
