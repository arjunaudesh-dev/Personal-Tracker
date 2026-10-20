'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

import { BoardNavigationHeader } from './BoardNavigationHeader';
import { CanvasToolDock, type CanvasTool } from './CanvasToolDock';
import { CmsysSyncModal } from './CmsysSyncModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { LinkTaskModal } from './LinkTaskModal';
import { MindMapCanvas } from './MindMapCanvas';
import { MindMapToolbar } from './MindMapToolbar';
import { MirrorTaskModal } from './MirrorTaskModal';
import { TaskDetailDrawer } from './TaskDetailDrawer';
import { TaskSpaceBar } from './TaskSpaceBar';
import type { Stroke } from './FreehandCanvasOverlay';
import { snapshotTasks, useCanvasHistory } from './useCanvasHistory';

/** Master mind-map workspace — canvas, tools, boards, drawer and modals. */
export function MindMapWorkspace() {
  const { state, dispatch } = useNexus();
  const [tool, setTool] = useState<CanvasTool>('select');
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [linkOpen, setLinkOpen] = useState(false);
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [cmsysOpen, setCmsysOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [layoutNonce, setLayoutNonce] = useState(0);

  const history = useCanvasHistory(snapshotTasks(state.tasks));
  const tasksRef = useRef(state.tasks);
  tasksRef.current = state.tasks;

  /** Push the current graph state onto the undo stack. */
  const record = useCallback(() => {
    history.set(snapshotTasks(tasksRef.current));
  }, [history]);

  /** Restore a snapshot across the whole graph. */
  const applySnapshot = useCallback(
    (snapshot: ReturnType<typeof snapshotTasks>) => {
      const current = new Map(tasksRef.current.map((t) => [t.id, t]));
      Object.entries(snapshot.tasks).forEach(([id, fields]) => {
        const task = current.get(id);
        if (!task) return;
        const unchanged =
          task.status === fields.status &&
          task.progress === fields.progress &&
          task.isCollapsed === fields.isCollapsed &&
          task.posX === fields.posX &&
          task.posY === fields.posY;
        if (unchanged) return;
        dispatch({
          type: 'update-task',
          id,
          patch: {
            status: fields.status,
            progress: fields.progress,
            isCollapsed: fields.isCollapsed,
            posX: fields.posX,
            posY: fields.posY,
          },
        });
      });
    },
    [dispatch],
  );

  useEffect(() => {
    applySnapshot(history.value);
  }, [history.value, applySnapshot]);

  const handleUndo = useCallback(() => {
    history.undo();
  }, [history]);

  const handleRedo = useCallback(() => {
    history.redo();
  }, [history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (typing) return;
      if (e.key === 'd' || e.key === 'D') {
        setTool((t) => (t === 'draw' ? 'select' : 'draw'));
      }
      if (e.key === 'l' || e.key === 'L') {
        setLinkOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const addRootNode = useCallback(() => {
    dispatch({
      type: 'add-task',
      task: {
        id: uid('task'),
        parentId: null,
        boardId: state.activeBoardId,
        title: 'New engineering objective',
        markdownNotes: '',
        groupCategory:
          state.activeBoardId === 'health'
            ? 'Health'
            : state.activeBoardId === 'finance'
              ? 'Finance'
              : state.activeBoardId === 'carbon'
                ? 'Career'
                : 'Work',
        direction: 'LR',
        depth: 0,
        posX: 0,
        posY: 0,
        status: 'todo',
        priority: 'medium',
        tags: [],
        isCollapsed: false,
        progress: 0,
        isAutoCalculated: false,
        cashflow: null,
        reminders: [],
        attachments: [],
        contacts: [],
        aiInsight: null,
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
    window.setTimeout(record, 0);
  }, [dispatch, state.activeBoardId, record]);

  const onStrokeComplete = (points: Array<{ x: number; y: number }>) => {
    setStrokes((prev) => [...prev, { id: uid('stroke'), points }]);
  };

  const activeTaskId = state.selectedTaskId;

  return (
    <div className="flex h-full min-h-[calc(100vh-3.5rem)] flex-col gap-3 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BoardNavigationHeader />
        <div className="flex items-center gap-2">
          <button onClick={() => setCmsysOpen(true)} className="btn h-8 text-[11px]">
            CMSYS sync
          </button>
          <button onClick={() => setMirrorOpen(true)} className="btn h-8 text-[11px]">
            Mirror task
          </button>
          <button onClick={() => setLinkOpen(true)} className="btn btn-violet h-8 text-[11px]">
            Cross-link
          </button>
        </div>
      </div>

      <TaskSpaceBar />

      <div className="relative min-h-[560px] flex-1 overflow-hidden rounded-2xl border border-white/[0.08] bg-ink-900/40 shadow-glass backdrop-blur-xl">
        <MindMapToolbar
          onAddNode={addRootNode}
          onShowShortcuts={() => setShortcutsOpen(true)}
          onAutoLayout={() => setLayoutNonce((n) => n + 1)}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />

        <div className="absolute right-4 top-4">
          <CanvasToolDock
            active={tool}
            onChange={setTool}
            onAutoLayout={() => setLayoutNonce((n) => n + 1)}
          />
        </div>

        <div className="h-full w-full">
          <MindMapCanvas
            drawMode={tool === 'draw'}
            strokes={strokes}
            onStrokeComplete={onStrokeComplete}
            onClearStrokes={() => setStrokes([])}
            onRecord={record}
            layoutNonce={layoutNonce}
          />
        </div>

        <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
          <div className="rounded-xl border border-white/10 bg-ink-900/85 px-3 py-1.5 text-[10px] text-slate-500 backdrop-blur">
            <span className="font-mono text-nexus-cyan">{state.tasks.length}</span> nodes ·{' '}
            <span className="font-mono text-nexus-violet">{state.links.length}</span> cross-links ·{' '}
            <span className="font-mono text-nexus-amber">{strokes.length}</span> CAD strokes
          </div>
        </div>
      </div>

      <TaskDetailDrawer />
      <LinkTaskModal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        sourceTaskId={activeTaskId}
      />
      <MirrorTaskModal
        open={mirrorOpen}
        onClose={() => setMirrorOpen(false)}
        taskId={activeTaskId}
      />
      <CmsysSyncModal open={cmsysOpen} onClose={() => setCmsysOpen(false)} />
      <KeyboardShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
