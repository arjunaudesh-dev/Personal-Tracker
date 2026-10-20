import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import { mockBoards } from './mock-multi-board';
import { MindMapTaskNode } from '@/types/mindmap';

interface MirrorTaskModalProps {
  task: MindMapTaskNode | null;
  isOpen: boolean;
  onClose: () => void;
  onMirror: (taskId: string, targetBoardId: string) => void;
}

export function MirrorTaskModal({
  task,
  isOpen,
  onClose,
  onMirror,
}: MirrorTaskModalProps) {
  const [boardId, setBoardId] = useState(mockBoards[1].id);

  if (!isOpen || !task) return null;

  const handleConfirm = () => {
    onMirror(task.id, boardId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-5 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Copy className="w-4 h-4 text-sky-400" />
          <h3 className="text-sm font-bold text-white">Mirror Task to Sub-Board</h3>
        </div>

        <p className="text-xs text-slate-300 mb-4 line-clamp-2">
          Mirror &apos;{task.title}&apos; into a dedicated project board while keeping progress synchronized.
        </p>

        <div className="space-y-3">
          <select
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
          >
            {mockBoards.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-sky-500 hover:bg-sky-400 text-white font-bold py-2 rounded-xl text-xs"
          >
            Confirm Mirroring
          </button>
        </div>
      </div>
    </div>
  );
}
