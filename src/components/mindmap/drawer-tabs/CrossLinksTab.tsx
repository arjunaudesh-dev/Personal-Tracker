import React, { useState } from 'react';
import { Link2, Trash2, ArrowRight } from 'lucide-react';
import { MindMapTaskNode, CrossGroupLink, LinkRelation, GroupCategory } from '@/types/mindmap';

interface CrossLinksTabProps {
  task: MindMapTaskNode;
  allTasks: MindMapTaskNode[];
  crossLinks: CrossGroupLink[];
  onAddLink: (link: CrossGroupLink) => void;
  onRemoveLink: (linkId: string) => void;
}

export function CrossLinksTab({
  task,
  allTasks,
  crossLinks,
  onAddLink,
  onRemoveLink,
}: CrossLinksTabProps) {
  const [targetId, setTargetId] = useState('');
  const [relation, setRelation] = useState<LinkRelation>('depends_on');
  const [desc, setDesc] = useState('');

  const activeLinks = crossLinks.filter(
    (l) => l.sourceTaskId === task.id || l.targetTaskId === task.id
  );

  const candidateTasks = allTasks.filter((t) => t.id !== task.id);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;
    const targetTask = allTasks.find((t) => t.id === targetId);
    if (!targetTask) return;

    const newLink: CrossGroupLink = {
      id: `link_${Date.now()}`,
      sourceTaskId: task.id,
      targetTaskId: targetId,
      targetGroup: targetTask.groupCategory,
      relationshipType: relation,
      description: desc || `Linked to ${targetTask.title}`,
    };
    onAddLink(newLink);
    setTargetId('');
    setDesc('');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Cross-Domain Dependences ({activeLinks.length})
        </span>

        {activeLinks.map((l) => {
          const isSource = l.sourceTaskId === task.id;
          const otherId = isSource ? l.targetTaskId : l.sourceTaskId;
          const otherNode = allTasks.find((t) => t.id === otherId);

          return (
            <div
              key={l.id}
              className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-amber-500/20 text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5 font-bold text-amber-300">
                  <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    {l.relationshipType}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <span className="text-white truncate max-w-[200px]">
                    {otherNode?.title || otherId}
                  </span>
                </div>
                {l.description && (
                  <div className="text-[11px] text-slate-400 mt-1">{l.description}</div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onRemoveLink(l.id)}
                className="text-slate-500 hover:text-rose-400 p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleCreate} className="bg-slate-850 p-3 rounded-lg border border-white/5 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Link2 className="w-3.5 h-3.5 text-amber-400" /> + Connect Cross-Domain Node
        </span>

        <select
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
        >
          <option value="">Select target task across domains...</option>
          {candidateTasks.map((t) => (
            <option key={t.id} value={t.id}>
              [{t.groupCategory}] {t.title}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value as LinkRelation)}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          >
            <option value="depends_on">DEPENDS ON</option>
            <option value="blocks">BLOCKS</option>
            <option value="relates_to">RELATES TO</option>
          </select>
          <input
            type="text"
            placeholder="Link rationale..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={!targetId}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold py-1.5 rounded text-xs"
        >
          Create Cross-Link
        </button>
      </form>
    </div>
  );
}
