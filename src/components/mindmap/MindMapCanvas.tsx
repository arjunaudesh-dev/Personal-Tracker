import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MindMapTaskNode, CrossGroupLink, GroupCategory } from '@/types/mindmap';
import { initialMindMapTasks, initialCrossLinks } from './mock-data';
import { calculateBottomUpProgress } from './progress-rollup';
import { getLayoutedElements, getHiddenNodeIds } from './layout';
import { CustomTaskNode } from './CustomTaskNode';
import { HierarchyEdge } from './edges/HierarchyEdge';
import { CrossLinkEdge } from './edges/CrossLinkEdge';
import { CanvasHeaderHud } from './CanvasHeaderHud';
import { CanvasToolDock, CanvasToolMode } from './CanvasToolDock';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { FreehandCanvasOverlay } from './FreehandCanvasOverlay';
import { CmsysSyncModal } from './CmsysSyncModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LinkTaskModal } from './LinkTaskModal';
import { MirrorTaskModal } from './MirrorTaskModal';
import { useCanvasHistory } from './useCanvasHistory';

const nodeTypes = { customTask: CustomTaskNode };
const edgeTypes = { hierarchy: HierarchyEdge, crossLink: CrossLinkEdge };

export function MindMapCanvas() {
  const { state: tasks, set: setTasks } = useCanvasHistory(
    calculateBottomUpProgress(initialMindMapTasks)
  );
  const [crossLinks, setCrossLinks] = useState<CrossGroupLink[]>(initialCrossLinks);
  const [currentBoardId, setCurrentBoardId] = useState('master-command');
  const [selectedGroup, setSelectedGroup] = useState<GroupCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState<MindMapTaskNode | null>(null);
  const [toolMode, setToolMode] = useState<CanvasToolMode>('select');

  // Modals state
  const [isCmsysOpen, setCmsysOpen] = useState(false);
  const [isShortcutsOpen, setShortcutsOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);
  const [mirrorTask, setMirrorTask] = useState<MindMapTaskNode | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = selectedGroup === 'All' || t.groupCategory === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [tasks, searchQuery, selectedGroup]);

  const hiddenNodeIds = useMemo(() => getHiddenNodeIds(tasks), [tasks]);
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const layout = getLayoutedElements(filteredTasks, hiddenNodeIds);
    const crossEdges: Edge[] = crossLinks.map((l) => ({
      id: `cle-${l.id}`,
      source: l.sourceTaskId,
      target: l.targetTaskId,
      type: 'crossLink',
    }));
    return { nodes: layout.nodes, edges: [...layout.edges, ...crossEdges] };
  }, [filteredTasks, hiddenNodeIds, crossLinks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  const handleToggleCollapse = useCallback((id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, isCollapsed: !t.isCollapsed } : t)));
  }, [setTasks]);

  const handleToggleStatus = useCallback((id: string) => {
    setTasks((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, status: (t.status === 'done' ? 'todo' : 'done') as any, progress: t.status === 'done' ? 0 : 100 } : t
      );
      return calculateBottomUpProgress(updated);
    });
  }, [setTasks]);

  const handleAddChild = useCallback((parentId: string) => {
    const parent = tasks.find((t) => t.id === parentId);
    const newTask: MindMapTaskNode = {
      id: `task_${Date.now()}`,
      parentId,
      title: 'New Tactical Execution Step',
      groupCategory: parent?.groupCategory || 'Civil',
      status: 'todo',
      priority: 'medium',
      progress: 0,
      depth: (parent?.depth || 0) + 1,
    };
    setTasks((prev) => calculateBottomUpProgress([...prev, newTask]));
    setSelectedTask(newTask);
  }, [tasks, setTasks]);

  const handleUpdateTask = useCallback((updated: MindMapTaskNode) => {
    setTasks((prev) => calculateBottomUpProgress(prev.map((t) => (t.id === updated.id ? updated : t))));
    setSelectedTask(updated);
  }, [setTasks]);

  useEffect(() => {
    setNodes(
      layoutedNodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          onSelect: (t: MindMapTaskNode) => setSelectedTask(t),
          onToggleCollapse: handleToggleCollapse,
          onAddChild: handleAddChild,
          onOpenLinkModal: (id: string) => setLinkSourceId(id),
          onSetAlarm: (id: string) => {
            const found = tasks.find((t) => t.id === id);
            if (found) setSelectedTask(found);
          },
          onToggleStatus: handleToggleStatus,
        },
      }))
    );
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, handleToggleCollapse, handleAddChild, handleToggleStatus, tasks, setNodes, setEdges]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: tasks.length };
    tasks.forEach((t) => { map[t.groupCategory] = (map[t.groupCategory] || 0) + 1; });
    return map;
  }, [tasks]);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-[#090d16] overflow-hidden">
      <CanvasHeaderHud
        currentBoardId={currentBoardId}
        onSelectBoard={(b) => setCurrentBoardId(b.id)}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
        counts={counts}
        tasks={tasks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRelayout={() => setTasks((prev) => [...prev])}
        onExpandAll={() => setTasks((prev) => prev.map((t) => ({ ...t, isCollapsed: false })))}
        onCollapseAll={() => setTasks((prev) => prev.map((t) => ({ ...t, isCollapsed: true })))}
        onAddTask={() => handleAddChild('root-civil-ops')}
      />

      <div className="absolute left-4 top-24 z-20">
        <CanvasToolDock
          mode={toolMode}
          onChangeMode={setToolMode}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          onOpenCmsys={() => setCmsysOpen(true)}
        />
      </div>

      <FreehandCanvasOverlay isActive={toolMode === 'draw'} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        panOnDrag={toolMode === 'pan' || toolMode === 'select'}
        selectionOnDrag={toolMode === 'select'}
        minZoom={0.2}
        maxZoom={1.8}
        className="bg-[#090d16]"
      >
        <Background color="#1e293b" gap={24} size={1.5} />
        <Controls className="!bg-slate-900 !border-white/10 !fill-white" />
        <MiniMap
          nodeStrokeColor="#38bdf8"
          nodeColor="#1e293b"
          className="!bg-slate-950/80 !border-white/10 rounded-xl"
        />
      </ReactFlow>

      <TaskDetailDrawer
        task={selectedTask}
        allTasks={tasks}
        crossLinks={crossLinks}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onUpdateTask={handleUpdateTask}
        onAddLink={(l) => setCrossLinks((prev) => [...prev, l])}
        onRemoveLink={(id) => setCrossLinks((prev) => prev.filter((x) => x.id !== id))}
      />

      <CmsysSyncModal isOpen={isCmsysOpen} onClose={() => setCmsysOpen(false)} />
      <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <LinkTaskModal
        sourceTaskId={linkSourceId}
        tasks={tasks}
        isOpen={Boolean(linkSourceId)}
        onClose={() => setLinkSourceId(null)}
        onAddLink={(l) => setCrossLinks((prev) => [...prev, l])}
      />
      <MirrorTaskModal
        task={mirrorTask}
        isOpen={Boolean(mirrorTask)}
        onClose={() => setMirrorTask(null)}
        onMirror={(tId, bId) => alert(`Mirrored task ${tId} to board ${bId}`)}
      />
    </div>
  );
}
