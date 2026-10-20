'use client';

import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { Modal } from '@/components/ui/Modal';
import { BOARDS } from './mock-multi-board';
import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

/** Multi-board task mirroring modal. */
export function MirrorTaskModal({
  open,
  onClose,
  taskId,
}: {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
}) {
  const { state, dispatch } = useNexus();
  const [targetBoard, setTargetBoard] = useState('work');
  const [keepLinks, setKeepLinks] = useState(true);

  const task = state.tasks.find((t) => t.id === taskId);
  const boards = BOARDS.filter((b) => b.id !== 'master' && b.id !== task?.boardId);

  const mirror = () => {
    if (!task) return;
    const clone: MindMapTaskNode = {
      ...task,
      id: uid('task'),
      title: `${task.title} (mirror)`,
      boardId: targetBoard,
      posX: 0,
      posY: 0,
      status: 'todo',
      progress: task.isAutoCalculated ? 0 : task.progress,
      isAutoCalculated: false,
      aiInsight: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'add-task', task: clone });

    if (keepLinks) {
      state.links
        .filter((l) => l.sourceTaskId === task.id)
        .forEach((link) =>
          dispatch({
            type: 'add-link',
            link: {
              ...link,
              id: uid('link'),
              sourceTaskId: clone.id,
              description: `Mirrored from ${task.title}`,
              createdAt: new Date().toISOString(),
            },
          }),
        );
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mirror task to another board"
      subtitle={task ? task.title : ''}
      accent="cyan"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={mirror} className="btn btn-primary">
            Create mirror
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="label-caps mb-2">Target board</p>
          <div className="grid grid-cols-2 gap-1.5">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => setTargetBoard(board.id)}
                className={`rounded-xl border px-3 py-2 text-left transition-all ${
                  targetBoard === board.id
                    ? 'border-nexus-cyan/50 bg-nexus-cyan/12'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <span className="block text-[11px] font-semibold text-slate-200">{board.name}</span>
                <span className="block text-[9.5px] text-slate-500">{board.subtitle}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-[11px] text-slate-400">
          <input
            type="checkbox"
            checked={keepLinks}
            onChange={(e) => setKeepLinks(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-white/20 bg-transparent accent-nexus-cyan"
          />
          Duplicate outgoing cross-links on the mirror
        </label>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 text-[10.5px] leading-relaxed text-slate-500">
          Mirroring creates an independent copy in the target board with progress reset. The mirror
          is used when the same deliverable must be tracked from two governance perspectives — for
          example a site package mirrored into the command board for tracking.
        </div>
      </div>
    </Modal>
  );
}
