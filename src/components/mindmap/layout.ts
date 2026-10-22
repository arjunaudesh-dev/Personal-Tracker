import dagre from 'dagre';
import type { Edge } from '@xyflow/react';
import type { TaskFlowNode } from './TaskNode';
import type { Task } from '@/types/nexus';
import { getHiddenNodeIds } from '@/lib/rollup';

export const NODE_W = 230;
export const NODE_H = 96;

/** Left-to-right hierarchical layout (dagre rankdir LR, nodesep 40, ranksep 90). */
export function layoutTasks(
  tasks: Task[],
  progress: Map<string, { progress: number; depth: number; children: string[] }>,
  filter: { group: string; query: string },
): { nodes: TaskFlowNode[]; edges: Edge[] } {
  const hidden = getHiddenNodeIds(tasks);
  const q = filter.query.trim().toLowerCase();
  const visible = tasks.filter((t) => !hidden.has(t.id) && (filter.group === 'All' || t.group === filter.group || !t.parentId));
  const ids = new Set(visible.map((t) => t.id));
  const matchesQuery = (t: Task) => !q || t.title.toLowerCase().includes(q);
  const shown = visible.filter((t) => matchesQuery(t) || visible.some((c) => c.parentId === t.id && matchesQuery(c)) || !t.parentId);

  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 90, marginx: 20, marginy: 20 });
  for (const t of shown) g.setNode(t.id, { width: NODE_W, height: NODE_H });
  const edges: Edge[] = [];
  for (const t of shown) {
    if (t.parentId && ids.has(t.parentId) && shown.some((s) => s.id === t.parentId)) {
      g.setEdge(t.parentId, t.id);
      edges.push({ id: `e-${t.parentId}-${t.id}`, source: t.parentId, target: t.id, type: 'default', animated: false });
    }
  }
  dagre.layout(g);

  const nodes: TaskFlowNode[] = shown.map((t) => {
    const pos = g.node(t.id);
    const meta = progress.get(t.id);
    return {
      id: t.id,
      type: 'task',
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      data: { task: t, progress: meta?.progress ?? 0, childCount: meta?.children.length ?? 0 },
      style: { width: NODE_W },
    };
  });
  return { nodes, edges };
}
