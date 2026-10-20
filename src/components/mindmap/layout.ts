import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { MindMapTaskNode } from '@/types/mindmap';

const NODE_WIDTH = 290;
const NODE_HEIGHT = 120;

export function getHiddenNodeIds(tasks: MindMapTaskNode[]): Set<string> {
  const hidden = new Set<string>();
  const collapsedIds = new Set(tasks.filter((t) => t.isCollapsed).map((t) => t.id));

  function hideDescendants(parentId: string) {
    tasks
      .filter((t) => t.parentId === parentId)
      .forEach((child) => {
        hidden.add(child.id);
        hideDescendants(child.id);
      });
  }

  collapsedIds.forEach((id) => hideDescendants(id));
  return hidden;
}

export function getLayoutedElements(
  tasks: MindMapTaskNode[],
  hiddenIds: Set<string> = new Set()
): { nodes: Node[]; edges: Edge[] } {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 40,
    ranksep: 90,
    marginx: 40,
    marginy: 40,
  });

  const visibleTasks = tasks.filter((t) => !hiddenIds.has(t.id));

  visibleTasks.forEach((task) => {
    dagreGraph.setNode(task.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  const edges: Edge[] = [];
  visibleTasks.forEach((task) => {
    if (task.parentId && !hiddenIds.has(task.parentId)) {
      const edgeId = `e-${task.parentId}-${task.id}`;
      dagreGraph.setEdge(task.parentId, task.id);
      edges.push({
        id: edgeId,
        source: task.parentId,
        target: task.id,
        type: 'hierarchy',
        animated: task.status === 'in_progress',
        style: { stroke: '#38bdf8', strokeWidth: 2 },
      });
    }
  });

  dagre.layout(dagreGraph);

  const nodes: Node[] = visibleTasks.map((task) => {
    const nodeWithPos = dagreGraph.node(task.id);
    return {
      id: task.id,
      type: 'customTask',
      position: {
        x: nodeWithPos ? nodeWithPos.x - NODE_WIDTH / 2 : (task.posX || 0),
        y: nodeWithPos ? nodeWithPos.y - NODE_HEIGHT / 2 : (task.posY || 0),
      },
      data: {
        task,
        hasChildren: tasks.some((t) => t.parentId === task.id),
      },
    };
  });

  return { nodes, edges };
}
