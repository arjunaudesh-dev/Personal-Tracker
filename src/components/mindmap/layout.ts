import dagre from 'dagre';

import type { CrossGroupLink, Direction, MindMapTaskNode } from '@/lib/types/mindmap';

export const NODE_WIDTH = 252;
export const NODE_HEIGHT = 92;

export interface PositionedNode {
  id: string;
  x: number;
  y: number;
}

/**
 * Left-to-right hierarchical layout via dagre.
 * Parent-to-child edges flow from the source right handle to the target left handle.
 */
export function applyDagreLayout(
  tasks: MindMapTaskNode[],
  visibleIds: Set<string>,
  direction: Direction = 'LR',
): PositionedNode[] {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: 34,
    ranksep: 92,
    marginx: 40,
    marginy: 40,
  });

  const visible = tasks.filter((t) => visibleIds.has(t.id));
  const visibleSet = new Set(visible.map((t) => t.id));

  visible.forEach((task) => {
    graph.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  visible.forEach((task) => {
    if (task.parentId && visibleSet.has(task.parentId)) {
      graph.setEdge(task.parentId, task.id, { weight: 1, minlen: 1 });
    }
  });

  dagre.layout(graph);

  return visible.map((task) => {
    const node = graph.node(task.id);
    return {
      id: task.id,
      x: (node?.x ?? 0) - NODE_WIDTH / 2,
      y: (node?.y ?? 0) - NODE_HEIGHT / 2,
    };
  });
}

/** Flow edges for the visible subgraph only. */
export function hierarchyEdges(
  tasks: MindMapTaskNode[],
  visibleIds: Set<string>,
) {
  return tasks
    .filter((t) => t.parentId && visibleIds.has(t.id) && visibleIds.has(t.parentId))
    .map((t) => ({
      id: `h_${t.parentId}__${t.id}`,
      source: t.parentId as string,
      target: t.id,
      type: 'hierarchy',
    }));
}

/** Cross-group dependency edges rendered as dashed glowing links. */
export function crossLinkEdges(
  links: CrossGroupLink[],
  visibleIds: Set<string>,
) {
  return links
    .filter((l) => visibleIds.has(l.sourceTaskId) && visibleIds.has(l.targetTaskId))
    .map((l) => ({
      id: `c_${l.id}`,
      source: l.sourceTaskId,
      target: l.targetTaskId,
      type: 'crosslink',
      data: { relationshipType: l.relationshipType, description: l.description },
    }));
}

/** Translate a task position change into the store patch shape. */
export function positionPatch(id: string, x: number, y: number) {
  return { id, patch: { posX: Math.round(x), posY: Math.round(y) } };
}
