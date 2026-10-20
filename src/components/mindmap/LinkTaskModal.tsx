'use client';

import { useState } from 'react';

import type { RelationshipType } from '@/lib/types/mindmap';
import { Modal } from '@/components/ui/Modal';
import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

const RELATIONSHIPS: Array<{ value: RelationshipType; label: string; hint: string }> = [
  { value: 'depends_on', label: 'DEPENDS ON', hint: 'This task cannot start until the target completes.' },
  { value: 'blocks', label: 'BLOCKS', hint: 'This task is the blocker for the target.' },
  { value: 'relates_to', label: 'RELATED TO', hint: 'Contextual association across boards.' },
];

/** Interactive cross-space linking modal. */
export function LinkTaskModal({
  open,
  onClose,
  sourceTaskId,
}: {
  open: boolean;
  onClose: () => void;
  sourceTaskId: string | null;
}) {
  const { state, dispatch } = useNexus();
  const [targetId, setTargetId] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('depends_on');
  const [description, setDescription] = useState('');

  const source = state.tasks.find((t) => t.id === sourceTaskId);

  const submit = () => {
    if (!source || !targetId) return;
    const target = state.tasks.find((t) => t.id === targetId);
    dispatch({
      type: 'add-link',
      link: {
        id: uid('link'),
        sourceTaskId: source.id,
        targetTaskId: targetId,
        targetGroup: target?.groupCategory ?? 'System',
        relationshipType: relationship,
        description:
          description.trim() ||
          `${source.title} ${relationship.replace('_', ' ')} ${target?.title ?? targetId}`,
        createdAt: new Date().toISOString(),
      },
    });
    setTargetId('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create cross-space link"
      subtitle={source ? `From: ${source.title}` : 'Select a source node first'}
      accent="violet"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={submit} disabled={!targetId} className="btn btn-violet">
            Create link
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="label-caps mb-2">Relationship</p>
          <div className="grid grid-cols-3 gap-1.5">
            {RELATIONSHIPS.map((rel) => (
              <button
                key={rel.value}
                onClick={() => setRelationship(rel.value)}
                className={`rounded-xl border px-2 py-2 text-center transition-all ${
                  relationship === rel.value
                    ? 'border-nexus-violet/50 bg-nexus-violet/15 text-nexus-violet'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25'
                }`}
              >
                <span className="block text-[10.5px] font-semibold">{rel.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[10.5px] text-slate-500">
            {RELATIONSHIPS.find((r) => r.value === relationship)?.hint}
          </p>
        </div>

        <div>
          <p className="label-caps mb-2">Target task</p>
          <select value={targetId} onChange={(e) => setTargetId(e.target.value)} className="input">
            <option value="">Select target…</option>
            {state.tasks
              .filter((t) => t.id !== sourceTaskId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.groupCategory}] {t.title}
                </option>
              ))}
          </select>
        </div>

        <div>
          <p className="label-caps mb-2">Description</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Why does this dependency exist?"
            className="input resize-y"
          />
        </div>
      </div>
    </Modal>
  );
}
