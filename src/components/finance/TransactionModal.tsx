'use client';

import { useEffect, useState } from 'react';

import type { Bucket, FinancialTransaction, TxType } from '@/lib/types/nexus';
import { Modal } from '@/components/ui/Modal';
import { useNexus } from '@/store/nexus-store';
import { isoDate, uid } from '@/lib/parser/utils';

const CATEGORIES = [
  'Site Accommodation',
  'Utilities — Electricity',
  'Fuel & Vehicle Running',
  'Cement & Aggregates',
  'Site Consumables',
  'Food & Household',
  'Insurance Premium',
  'Gym Membership',
  'Survey Instrument Upgrade',
  'Civil Capital Sinking Fund',
  'Emergency Reserve Top-up',
  'Vehicle Loan Extra Payment',
  'Salary — Engineering Division',
  'Consultancy Retainer',
];

/** Add / edit transaction modal with task linking. */
export function TransactionModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: FinancialTransaction | null;
}) {
  const { state, dispatch } = useNexus();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [bucket, setBucket] = useState<Bucket>('needs');
  const [type, setType] = useState<TxType>('expense');
  const [date, setDate] = useState(isoDate());
  const [linkedTaskId, setLinkedTaskId] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setTitle(editing.title);
      setAmount(String(editing.amount));
      setCategory(editing.category);
      setBucket(editing.bucket);
      setType(editing.type);
      setDate(editing.date);
      setLinkedTaskId(editing.linkedTaskId ?? '');
    } else {
      setTitle('');
      setAmount('');
      setCategory(CATEGORIES[0]);
      setBucket('needs');
      setType('expense');
      setDate(isoDate());
      setLinkedTaskId('');
    }
  }, [open, editing]);

  const submit = () => {
    const value = Number(amount);
    if (!title.trim() || !value) return;
    const payload = {
      amount: value,
      currency: state.currency,
      title: title.trim(),
      category,
      bucket,
      type,
      date,
      linkedTaskId: linkedTaskId || null,
    };
    if (editing) {
      dispatch({ type: 'update-transaction', id: editing.id, patch: payload });
    } else {
      dispatch({
        type: 'add-transaction',
        transaction: {
          id: uid('tx'),
          ...payload,
          status: 'settled',
          createdAt: new Date().toISOString(),
        },
      });
    }
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit transaction' : 'Capture transaction'}
      subtitle="Every entry can be linked to a mind-map task for task-linked committed spend"
      accent="amber"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button onClick={submit} className="btn btn-primary">
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <p className="label-caps mb-1.5">Type</p>
          <div className="grid grid-cols-2 gap-1.5">
            {(['expense', 'income'] as TxType[]).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setType(t);
                  if (t === 'income') setBucket('savings');
                }}
                className={`rounded-xl border px-3 py-2 text-[11px] font-semibold capitalize transition-all ${
                  type === t
                    ? t === 'income'
                      ? 'border-nexus-emerald/50 bg-nexus-emerald/12 text-nexus-emerald'
                      : 'border-nexus-rose/50 bg-nexus-rose/12 text-nexus-rose'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/25'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <p className="label-caps mb-1.5">Title</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="e.g. Non-shrink grout delivery" />
          </div>
          <div>
            <p className="label-caps mb-1.5">Amount ({state.currency})</p>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.01"
              className="input"
              placeholder="0.00"
            />
          </div>
          <div>
            <p className="label-caps mb-1.5">Date</p>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" className="input" />
          </div>
          <div>
            <p className="label-caps mb-1.5">Category</p>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="label-caps mb-1.5">Bucket</p>
            <select
              value={bucket}
              onChange={(e) => setBucket(e.target.value as Bucket)}
              className="input"
            >
              <option value="needs">Needs (50%)</option>
              <option value="wants">Wants (30%)</option>
              <option value="savings">Savings &amp; Sinking (20%)</option>
            </select>
          </div>
          <div className="col-span-2">
            <p className="label-caps mb-1.5">Link to task (optional)</p>
            <select
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
              className="input"
            >
              <option value="">Not linked</option>
              {state.tasks
                .filter((t) => t.depth > 0)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.groupCategory}] {t.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>
    </Modal>
  );
}
