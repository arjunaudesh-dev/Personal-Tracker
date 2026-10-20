'use client';

import { ArrowRight, Link2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode, RelationshipType } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

const RELATIONSHIPS: RelationshipType[] = ['depends_on', 'blocks', 'relates_to'];

/** Tab 5 — DEPENDS ON / BLOCKS / RELATED TO cross-group links. */
export function CrossLinksTab({ task }: { task: MindMapTaskNode }) {
  const { state, dispatch } = useNexus();
  const [targetId, setTargetId] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('depends_on');

  const outgoing = state.links.filter((l) => l.sourceTaskId === task.id);
  const incoming = state.links.filter((l) => l.targetTaskId === task.id);
  const candidates = state.tasks.filter((t) => t.id !== task.id);

  const addLink = () => {
    if (!targetId) return;
    const target = state.tasks.find((t) => t.id === targetId);
    dispatch({
      type: 'add-link',
      link: {
        id: uid('link'),
        sourceTaskId: task.id,
        targetTaskId: targetId,
        targetGroup: target?.groupCategory ?? 'System',
        relationshipType: relationship,
        description: `${relationship.replace('_', ' ')} → ${target?.title ?? targetId}`,
        createdAt: new Date().toISOString(),
      },
    });
    setTargetId('');
  };

  const removeLink = (id: string) => dispatch({ type: 'remove-link', id });

  return (
    <div className="space-y-4">
      <section>
        <p className="label-caps mb-2">This task depends on / blocks ({outgoing.length})</p>
        {outgoing.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
            No outgoing links.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {outgoing.map((link) => {
              const target = state.tasks.find((t) => t.id === link.targetTaskId);
              return (
                <li
                  key={link.id}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                >
                  <span className="chip border-nexus-violet/30 bg-nexus-violet/10 text-nexus-violet">
                    {link.relationshipType.replace('_', ' ')}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                    {target?.title ?? link.targetTaskId}
                  </span>
                  <span className="chip">{link.targetGroup}</span>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="btn btn-ghost h-6 w-6 p-0 text-slate-600 hover:text-nexus-rose"
                    aria-label="Remove link"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <p className="label-caps mb-2">Linked to this task ({incoming.length})</p>
        {incoming.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
            No incoming links.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {incoming.map((link) => {
              const source = state.tasks.find((t) => t.id === link.sourceTaskId);
              return (
                <li
                  key={link.id}
                  className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
                >
                  <Link2 className="h-3 w-3 shrink-0 text-nexus-cyan" />
                  <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                    {source?.title ?? link.sourceTaskId}
                  </span>
                  <span className="chip border-nexus-rose/25 bg-nexus-rose/10 text-nexus-rose">
                    {link.relationshipType.replace('_', ' ')}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="glass-soft p-3">
        <p className="label-caps mb-2">Create cross-space link</p>
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="input flex-1"
          >
            <option value="">Select target task…</option>
            {candidates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.groupCategory} — {t.title}
              </option>
            ))}
          </select>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value as RelationshipType)}
            className="input sm:w-36"
          >
            {RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>
                {r.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button onClick={addLink} className="btn btn-violet">
            <ArrowRight className="h-3 w-3" />
            Link
          </button>
        </div>
      </section>
    </div>
  );
}
