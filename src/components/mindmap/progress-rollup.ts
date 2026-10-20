import type { MindMapTaskNode } from '@/lib/types/mindmap';

/**
 * Bottom-up progress rollup.
 * A parent node aggregates the completion of its children; a leaf keeps its
 * own manually-set progress. Parents are flagged `isAutoCalculated`.
 *
 * The computation is memoised per node with a cycle guard so that a node is
 * never evaluated twice with a different result.
 */
export function rollupProgress(tasks: MindMapTaskNode[]): MindMapTaskNode[] {
  const byParent = new Map<string, MindMapTaskNode[]>();
  const nodes = new Map(tasks.map((t) => [t.id, { ...t }]));

  for (const task of tasks) {
    if (!task.parentId) continue;
    const bucket = byParent.get(task.parentId) ?? [];
    bucket.push(task);
    byParent.set(task.parentId, bucket);
  }

  const memo = new Map<string, number>();

  const compute = (id: string, stack: Set<string>): number => {
    const cached = memo.get(id);
    if (cached !== undefined) return cached;
    if (stack.has(id)) return 0;

    const node = nodes.get(id);
    if (!node) return 0;

    stack.add(id);
    const children = byParent.get(id) ?? [];
    let value: number;

    if (children.length === 0) {
      value = node.progress;
    } else {
      const total = children.reduce((acc, child) => acc + compute(child.id, stack), 0);
      value = Math.round(total / children.length);
    }

    stack.delete(id);
    memo.set(id, value);
    return value;
  };

  for (const task of tasks) {
    const node = nodes.get(task.id);
    if (!node) continue;
    node.progress = compute(task.id, new Set());
    node.isAutoCalculated = (byParent.get(task.id) ?? []).length > 0;
  }

  return tasks.map((t) => nodes.get(t.id)!);
}

/** Ids of every descendant of the given node ids (used for branch collapse). */
export function getHiddenNodeIds(
  tasks: MindMapTaskNode[],
  collapsedIds: string[],
): Set<string> {
  if (collapsedIds.length === 0) return new Set();
  const childrenOf = new Map<string, string[]>();
  for (const task of tasks) {
    if (!task.parentId) continue;
    const list = childrenOf.get(task.parentId) ?? [];
    list.push(task.id);
    childrenOf.set(task.parentId, list);
  }

  const hidden = new Set<string>();
  const walk = (id: string) => {
    for (const child of childrenOf.get(id) ?? []) {
      if (hidden.has(child)) continue;
      hidden.add(child);
      walk(child);
    }
  };
  collapsedIds.forEach(walk);
  return hidden;
}

/** Ancestor chain (root first) for a given node id. */
export function getAncestors(tasks: MindMapTaskNode[], id: string): MindMapTaskNode[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const chain: MindMapTaskNode[] = [];
  let cursor = byId.get(id)?.parentId ?? null;
  while (cursor) {
    const node = byId.get(cursor);
    if (!node) break;
    chain.unshift(node);
    cursor = node.parentId;
  }
  return chain;
}

/** Direct children of a node. */
export function getChildren(tasks: MindMapTaskNode[], id: string): MindMapTaskNode[] {
  return tasks.filter((t) => t.parentId === id);
}

/** Aggregate task rollup for a group category. */
export function groupProgress(tasks: MindMapTaskNode[], category: string) {
  const subset = tasks.filter((t) => t.groupCategory === category && t.depth > 0);
  if (!subset.length) return 0;
  const total = subset.reduce((acc, t) => acc + t.progress, 0);
  return Math.round(total / subset.length);
}

/** Count of tasks that are blocked or overdue. */
export function countBottlenecks(tasks: MindMapTaskNode[], today: string) {
  return tasks.filter(
    (t) =>
      t.status === 'blocked' ||
      (t.dueDate !== null && t.dueDate < today && t.status !== 'done'),
  ).length;
}
