'use client';

import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Background, BackgroundVariant, Controls, MiniMap, ReactFlowProvider, useReactFlow, type NodeMouseHandler } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize2, Plus, Search, Expand } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { TaskNode, type TaskFlowNode } from './TaskNode';
import { Inspector } from './Inspector';
import { layoutTasks } from './layout';
import { PageHeader } from '@/components/ui/PageHeader';
import { CurrencyToggle } from '@/components/ui/CurrencyToggle';
import { formatMoney } from '@/lib/utils';
import { boqTotal } from '@/lib/rollup';

const nodeTypes = { task: TaskNode };
const GROUP_FILTERS = ['All', 'Civil', 'Health', 'Finance', 'Personal'];

function FitOnChange({ signature }: { signature: string }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const id = requestAnimationFrame(() => fitView({ padding: 0.2, duration: 400 }));
    return () => cancelAnimationFrame(id);
  }, [signature, fitView]);
  return null;
}

function Canvas() {
  const { state, progress, addTask, updateTask } = useNexus();
  const [group, setGroup] = useState('All');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('civ-dock');

  const { nodes, edges } = useMemo(() => layoutTasks(state.tasks, progress, { group, query }), [state.tasks, progress, group, query]);
  const selected = state.tasks.find((t) => t.id === selectedId) ?? null;
  const signature = nodes.map((n) => n.id).join('|') + `:${group}:${query}`;
  const totalBoq = state.tasks.reduce((s, t) => s + boqTotal(t), 0);

  const onNodeClick: NodeMouseHandler<TaskFlowNode> = (_, node) => setSelectedId(node.id);

  return (
    <>
      <PageHeader
        eyebrow="Module A · Mind-Map, BOQ & CAD"
        title="Mind-Map & Bill of Quantities"
        description="Left-to-right task tree. Edit a leaf and every parent recalculates its progress. BOQ lines roll up into the budget."
        actions={<><CurrencyToggle /><button className="btn-primary" onClick={() => setSelectedId(addTask({ title: 'New branch', group: 'Personal' }))}><Plus className="h-4 w-4" /> Root branch</button></>}
      />

      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        <div className="glass p-3"><p className="text-[10px] uppercase text-slate-400">Tasks</p><p className="text-lg font-bold">{state.tasks.length}</p></div>
        <div className="glass p-3"><p className="text-[10px] uppercase text-slate-400">Done</p><p className="text-lg font-bold text-lime-300">{state.tasks.filter((t) => t.status === 'done').length}</p></div>
        <div className="glass p-3"><p className="text-[10px] uppercase text-slate-400">In progress</p><p className="text-lg font-bold text-amber-300">{state.tasks.filter((t) => t.status === 'doing').length}</p></div>
        <div className="glass p-3"><p className="text-[10px] uppercase text-slate-400">Civil rollup</p><p className="text-lg font-bold text-cyan-300">{progress.get('civ-root')?.progress ?? 0}%</p></div>
        <div className="glass p-3 md:col-span-2"><p className="text-[10px] uppercase text-slate-400">Total BOQ value</p><p className="text-lg font-bold text-violet-300">{formatMoney(totalBoq, state.currency)}</p></div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search branches…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search tasks" />
        </div>
        <div className="flex gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-1">
          {GROUP_FILTERS.map((g) => (
            <button key={g} onClick={() => setGroup(g)} className={`rounded-lg px-2.5 py-1 text-xs ${group === g ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{g}</button>
          ))}
        </div>
        <button className="btn-ghost" onClick={() => state.tasks.forEach((t) => t.collapsed && updateTask(t.id, { collapsed: false }))}><Expand className="h-4 w-4" /> Expand all</button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="glass relative h-[calc(100vh-22rem)] min-h-[520px] overflow-hidden">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedId(null)}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.6}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            colorMode="dark"
          >
            <FitOnChange signature={signature} />
            <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(148,163,184,0.25)" />
            <Controls showInteractive={false} />
            <MiniMap pannable zoomable nodeColor={(n) => ((n.data as { progress?: number }).progress === 100 ? '#a3e635' : '#22d3ee')} maskColor="rgba(5,7,20,0.6)" />
          </ReactFlow>
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-slate-950/70 px-2.5 py-1.5 text-[11px] text-slate-400">
            <Maximize2 className="h-3 w-3" /> Click a node to inspect · chevron collapses branch
          </div>
        </div>

        {selected ? (
          <Inspector key={selected.id} task={selected} onClose={() => setSelectedId(null)} />
        ) : (
          <div className="glass grid place-items-center p-8 text-center text-sm text-slate-400">Select a node to edit its status, notes, sub-tasks and BOQ.</div>
        )}
      </div>
    </>
  );
}

export function MindMapView() {
  return (
    <ReactFlowProvider>
      <Canvas />
    </ReactFlowProvider>
  );
}
