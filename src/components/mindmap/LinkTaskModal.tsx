import React, { useState } from 'react';
import { X, Link2 } from 'lucide-react';
import { MindMapTaskNode, CrossGroupLink, LinkRelation } from '@/types/mindmap';

interface LinkTaskModalProps {
  sourceTaskId: string | null;
  tasks: MindMapTaskNode[];
  isOpen: boolean;
  onClose: () => void;
  onAddLink: (link: CrossGroupLink) => void;
}

export function LinkTaskModal({
  sourceTaskId,
  tasks,
  isOpen,
  onClose,
  onAddLink,
}: LinkTaskModalProps) {
  const [targetId, setTargetId] = useState('');
  const [relation, setRelation] = useState<LinkRelation>('depends_on');
  const [desc, setDesc] = useState('');

  if (!isOpen || !sourceTaskId) return null;

  const sourceTask = tasks.find((t) => t.id === sourceTaskId);
  const targets = tasks.filter((t) => t.id !== sourceTaskId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    const targetTask = tasks.find((t) => t.id === targetId);
    if (!targetTask) return;

    onAddLink({
      id: `cgl_${Date.now()}`,
      sourceTaskId,
      targetTaskId: targetId,
      targetGroup: targetTask.groupCategory,
      relationshipType: relation,
      description: desc || `Linked to ${targetTask.title}`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Link2 className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">Create Cross-Domain Link</h3>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Source Node: <span className="text-sky-300 font-semibold">{sourceTask?.title}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Target Node</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
            >
              <option value="">Select target node...</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.groupCategory}] {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Relationship</label>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as LinkRelation)}
              className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
            >
              <option value="depends_on">DEPENDS ON</option>
              <option value="blocks">BLOCKS</option>
              <option value="relates_to">RELATES TO</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Description / Constraint</label>
            <input
              type="text"
              placeholder="e.g. Critical path requirement for concrete casting..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={!targetId}
              className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold py-2 rounded-xl text-xs"
            >
              Connect Nodes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
