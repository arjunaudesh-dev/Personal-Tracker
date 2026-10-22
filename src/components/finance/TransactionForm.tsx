'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { todayISO } from '@/lib/utils';
import type { Bucket, TxType } from '@/types/nexus';

export function TransactionForm() {
  const { addTransaction, state } = useNexus();
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense' as TxType, bucket: 'needs' as Bucket, category: 'Food', date: todayISO(), linkedTaskId: '' });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !(amount > 0)) return;
    addTransaction({ date: form.date, title: form.title.trim(), amount, type: form.type, bucket: form.bucket, category: form.category, linkedTaskId: form.linkedTaskId || null });
    setForm((f) => ({ ...f, title: '', amount: '' }));
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3 md:grid-cols-6">
      <div className="col-span-2 md:col-span-2"><label className="label" htmlFor="tx-title">Description</label><input id="tx-title" className="input" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Cement, salary…" /></div>
      <div><label className="label" htmlFor="tx-amt">Amount (USD)</label><input id="tx-amt" type="number" min={0} step="any" className="input" value={form.amount} onChange={(e) => set('amount', e.target.value)} /></div>
      <div><label className="label" htmlFor="tx-type">Type</label>
        <select id="tx-type" className="input" value={form.type} onChange={(e) => set('type', e.target.value as TxType)}><option value="expense">Expense</option><option value="income">Income</option></select></div>
      <div><label className="label" htmlFor="tx-bucket">Bucket</label>
        <select id="tx-bucket" className="input" value={form.bucket} onChange={(e) => set('bucket', e.target.value as Bucket)}><option value="needs">Needs 50%</option><option value="wants">Wants 30%</option><option value="savings">Savings 20%</option></select></div>
      <div><label className="label" htmlFor="tx-cat">Category</label><input id="tx-cat" className="input" value={form.category} onChange={(e) => set('category', e.target.value)} /></div>
      <div className="col-span-2 md:col-span-3"><label className="label" htmlFor="tx-link">Link to task (BOQ)</label>
        <select id="tx-link" className="input" value={form.linkedTaskId} onChange={(e) => set('linkedTaskId', e.target.value)}>
          <option value="">— none —</option>
          {state.tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select></div>
      <div className="col-span-2 flex items-end md:col-span-3"><button className="btn-primary w-full justify-center" type="submit"><Plus className="h-4 w-4" /> Add to ledger</button></div>
    </form>
  );
}
