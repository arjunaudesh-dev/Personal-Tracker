'use client';

import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { getHiddenNodeIds } from './progress-rollup';
import { applyDagreLayout, crossLinkEdges, hierarchyEdges } from './layout';
import { CustomTaskNode, type TaskNodeData } from './CustomTaskNode';
import { CrossLinkEdge, HierarchyEdge } from './edges/HierarchyEdge';
import { FreehandCanvasOverlay } from './FreehandCanvasOverlay';

const nodeTypes = { task: CustomTaskNode };
const edgeTypes = { hierarchy: HierarchyEdge, crosslink: CrossLinkEdge };

interface CanvasProps {
  drawMode: boolean;
  onStrokeComplete?: (points: Array<{ x: number; y: number }>) => void;
  strokes: Array<{ id: string; points: Array<{ x: number; y: number }> }>;
  onClearStrokes: () => void;
  onRecord?: () => void;
  layoutNonce?: number;
}

function MindMapCanvasInner({
  drawMode,
  onStrokeComplete,
  strokes,
  onClearStrokes,
  onRecord,
  layoutNonce = 0,
}: CanvasProps) {
  const { state, dispatch } = useNexus();
  const { fitView } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const visibleIds = useMemo(() => {
    const ids = new Set<string>();
    const board = state.activeBoardId;
    const space = state.activeSpaceId;

    const passes = (t: MindMapTaskNode) => {
      const boardOk = board === 'master' || t.boardId === board;
      const spaceOk =
        space === 'all' ||
        (space === 'all'
          ? true
          : t.groupCategory.toLowerCase() === space ||
            (space === 'work' && t.groupCategory === 'Work') ||
            (space === 'career' && (t.groupCategory === 'Career' || t.groupCategory === 'Personal')));
      return boardOk && spaceOk;
    };

    state.tasks.forEach((t) => {
      if (passes(t)) ids.add(t.id);
    });

    // keep ancestors of visible nodes for structural context
    const byId = new Map(state.tasks.map((t) => [t.id, t]));
    let grew = true;
    while (grew) {
      grew = false;
      for (const id of Array.from(ids)) {
        const parentId = byId.get(id)?.parentId;
        if (parentId && !ids.has(parentId)) {
          ids.add(parentId);
          grew = true;
        }
      }
    }
    return ids;
  }, [state.tasks, state.activeBoardId, state.activeSpaceId]);

  const collapsedIds = useMemo(
    () => state.tasks.filter((t) => t.isCollapsed).map((t) => t.id),
    [state.tasks],
  );

  const hiddenIds = useMemo(
    () => getHiddenNodeIds(state.tasks, collapsedIds),
    [state.tasks, collapsedIds],
  );

  const childCountMap = useMemo(() => {
    const counts = new Map<string, number>();
    state.tasks.forEach((t) => {
      if (!t.parentId) return;
      counts.set(t.parentId, (counts.get(t.parentId) ?? 0) + 1);
    });
    return counts;
  }, [state.tasks]);

  const onToggleCollapse = useCallback(
    (id: string) => {
      const task = state.tasks.find((t) => t.id === id);
      if (!task) return;
      dispatch({ type: 'set-collapsed', id, collapsed: !task.isCollapsed });
      onRecord?.();
    },
    [dispatch, state.tasks, onRecord],
  );

  const onOpen = useCallback(
    (id: string) => {
      dispatch({ type: 'select-task', taskId: id });
    },
    [dispatch],
  );

  const nodes = useMemo<Node<TaskNodeData>[]>(() => {
    const positions = applyDagreLayout(state.tasks, visibleIds, 'LR');
    const posMap = new Map(positions.map((p) => [p.id, p]));

    return state.tasks
      .filter((t) => visibleIds.has(t.id) && !hiddenIds.has(t.id))
      .map((t) => {
        const pos = posMap.get(t.id);
        return {
          id: t.id,
          type: 'task',
          position: { x: pos?.x ?? t.posX, y: pos?.y ?? t.posY },
          data: {
            task: t,
            childCount: childCountMap.get(t.id) ?? 0,
            onToggleCollapse,
            onOpen,
          },
          draggable: !drawMode,
          selectable: true,
        };
      });
  }, [state.tasks, visibleIds, hiddenIds, childCountMap, onToggleCollapse, onOpen, drawMode]);

  const edges = useMemo<Edge[]>(() => {
    const visibleSet = new Set(
      state.tasks.filter((t) => visibleIds.has(t.id) && !hiddenIds.has(t.id)).map((t) => t.id),
    );
    return [
      ...hierarchyEdges(state.tasks, visibleSet),
      ...crossLinkEdges(state.links, visibleSet),
    ] as Edge[];
  }, [state.tasks, state.links, visibleIds, hiddenIds]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fitView({ padding: 0.16, duration: 520, maxZoom: 1.05 });
    }, 220);
    return () => window.clearTimeout(timer);
  }, [fitView, state.activeBoardId, state.activeSpaceId, layoutNonce]);

  return (
    <div ref={wrapperRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={!drawMode}
        nodesConnectable={false}
        elementsSelectable
        onNodeClick={(_, node) => onOpen(node.id)}
        onNodeDragStop={(_, node) => {
          dispatch({
            type: 'update-task',
            id: node.id,
            patch: { posX: Math.round(node.position.x), posY: Math.round(node.position.y) },
          });
          onRecord?.();
        }}
        className="bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={26} size={1} color="rgba(148,163,184,0.14)" />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4 !overflow-hidden !rounded-xl !border !border-white/10 !bg-ink-900/85 !shadow-lg [&>button]:!border-white/10 [&>button]:!bg-transparent [&>button]:!fill-slate-400 [&>button:hover]:!bg-white/10"
        />
        <MiniMap
          pannable
          zoomable
          className="!bottom-4 !right-4 !h-24 !w-40 !rounded-xl !border !border-white/10 !bg-ink-900/85"
          maskColor="rgba(4,6,13,0.72)"
          nodeColor={(n) => {
            const task = (n.data as TaskNodeData | undefined)?.task;
            if (!task) return '#334155';
            if (task.status === 'blocked') return '#fb7185';
            if (task.status === 'done') return '#34d399';
            if (task.status === 'in-progress') return '#22d3ee';
            return '#64748b';
          }}
        />
      </ReactFlow>

      <FreehandCanvasOverlay
        enabled={drawMode}
        strokes={strokes}
        onComplete={onStrokeComplete}
        onClear={onClearStrokes}
      />
    </div>
  );
}

export function MindMapCanvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <MindMapCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
