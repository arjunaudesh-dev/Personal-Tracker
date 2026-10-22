import type {
  MindNode,
  NodeLink,
  NodeMeta,
  TaskStatus,
  Universe,
  UniverseStats,
} from '../types';

export interface Forest {
  byId: Map<string, MindNode>;
  childrenOf: Map<string, MindNode[]>;
  roots: MindNode[];
  rootsByUniverse: Map<string, MindNode[]>;
}

export const buildForest = (nodes: MindNode[]): Forest => {
  const byId = new Map<string, MindNode>();
  const childrenOf = new Map<string, MindNode[]>();
  const roots: MindNode[] = [];
  const rootsByUniverse = new Map<string, MindNode[]>();

  for (const n of nodes) byId.set(n.id, n);
  for (const n of nodes) {
    if (n.parentId && byId.has(n.parentId)) {
      const arr = childrenOf.get(n.parentId) ?? [];
      arr.push(n);
      childrenOf.set(n.parentId, arr);
    } else {
      roots.push(n);
      const arr = rootsByUniverse.get(n.universeId) ?? [];
      arr.push(n);
      rootsByUniverse.set(n.universeId, arr);
    }
  }
  for (const arr of childrenOf.values()) arr.sort((a, b) => a.order - b.order);
  roots.sort((a, b) => a.order - b.order);
  for (const arr of rootsByUniverse.values()) arr.sort((a, b) => a.order - b.order);
  return { byId, childrenOf, roots, rootsByUniverse };
};

export const chainToRoot = (node: MindNode, forest: Forest): MindNode[] => {
  const chain: MindNode[] = [node];
  let cur = node;
  let guard = 0;
  while (cur.parentId && guard++ < 200) {
    const parent = forest.byId.get(cur.parentId);
    if (!parent) break;
    chain.unshift(parent);
    cur = parent;
  }
  return chain;
};

export const subtreeIds = (id: string, forest: Forest): string[] => {
  const out: string[] = [];
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    out.push(cur);
    const kids = forest.childrenOf.get(cur) ?? [];
    for (const k of kids) stack.push(k.id);
  }
  return out;
};

export const computeMeta = (nodes: MindNode[], links: NodeLink[]): Map<string, NodeMeta> => {
  const forest = buildForest(nodes);
  const meta = new Map<string, NodeMeta>();
  const degree = new Map<string, number>();
  for (const l of links) {
    degree.set(l.from, (degree.get(l.from) ?? 0) + 1);
    degree.set(l.to, (degree.get(l.to) ?? 0) + 1);
  }

  const visit = (node: MindNode): NodeMeta => {
    const kids = forest.childrenOf.get(node.id) ?? [];
    let progress: number;
    let boq = node.boq;
    let descendants = 0;
    let doneCount = node.status === 'done' ? 1 : 0;

    if (kids.length) {
      const childMetas = kids.map(visit);
      progress =
        childMetas.reduce((sum, m) => sum + m.progress, 0) / childMetas.length;
      for (const m of childMetas) {
        boq += m.boq;
        descendants += m.descendants + 1;
        doneCount += m.doneCount;
      }
    } else {
      progress = leafProgress(node.status, node.progress);
    }

    const m: NodeMeta = {
      children: kids.length,
      descendants,
      doneCount,
      progress: Math.round(progress * 10) / 10,
      boq: Math.round(boq * 100) / 100,
      degree: degree.get(node.id) ?? 0,
    };
    meta.set(node.id, m);
    return m;
  };

  for (const root of forest.roots) visit(root);
  // orphan safety net
  for (const n of nodes) if (!meta.has(n.id)) visit(n);
  return meta;
};

export const leafProgress = (status: TaskStatus, progress: number): number => {
  if (status === 'done') return 100;
  if (status === 'todo') return Math.min(progress, 10);
  return Math.max(progress, 18);
};

export const universeStats = (
  universe: Universe,
  nodes: MindNode[],
  meta: Map<string, NodeMeta>,
): UniverseStats => {
  const own = nodes.filter((n) => n.universeId === universe.id);
  const forest = buildForest(nodes);
  const roots = forest.rootsByUniverse.get(universe.id) ?? [];

  let progress = 0;
  if (roots.length) {
    const totalWeight = roots.reduce((s, r) => s + Math.max(1, meta.get(r.id)?.descendants ?? 1), 0);
    progress =
      roots.reduce(
        (s, r) => s + (meta.get(r.id)?.progress ?? 0) * Math.max(1, meta.get(r.id)?.descendants ?? 1),
        0,
      ) / totalWeight;
  }

  const done = own.filter((n) => n.status === 'done').length;
  const doing = own.filter((n) => n.status === 'doing').length;
  const todo = own.length - done - doing;

  return {
    nodes: own.length,
    done,
    doing,
    todo,
    progress: Math.round(progress * 10) / 10,
    boq: Math.round(own.reduce((s, n) => s + n.boq, 0) * 100) / 100,
  };
};

export const aggregateStats = (
  universes: Universe[],
  nodes: MindNode[],
  meta: Map<string, NodeMeta>,
): UniverseStats => {
  const stats = universes.map((u) => universeStats(u, nodes, meta));
  const nodesCount = stats.reduce((s, x) => s + x.nodes, 0);
  const done = stats.reduce((s, x) => s + x.done, 0);
  const doing = stats.reduce((s, x) => s + x.doing, 0);
  const boq = stats.reduce((s, x) => s + x.boq, 0);

  const forest = buildForest(nodes);
  const roots = universes.flatMap((u) => forest.rootsByUniverse.get(u.id) ?? []);
  const weights = roots.map((r) => Math.max(1, meta.get(r.id)?.descendants ?? 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const progress =
    roots.reduce((s, r, i) => s + (meta.get(r.id)?.progress ?? 0) * weights[i], 0) /
    totalWeight;

  return {
    nodes: nodesCount,
    done,
    doing,
    todo: nodesCount - done - doing,
    progress: Math.round(progress * 10) / 10,
    boq: Math.round(boq * 100) / 100,
  };
};

export const statusLabel: Record<TaskStatus, string> = {
  todo: 'To do',
  doing: 'In progress',
  done: 'Done',
};

export const nextStatus = (s: TaskStatus): TaskStatus =>
  s === 'todo' ? 'doing' : s === 'doing' ? 'done' : 'todo';
