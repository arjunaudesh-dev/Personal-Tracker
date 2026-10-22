'use client';

import { useState } from 'react';
import { useNexus } from '@/lib/store';
import { uid } from '@/lib/utils';
import { useCurrencyLabel } from '@/lib/currency';
import type { MonthlyPackage } from '@/types/nexus';

const empty = (): MonthlyPackage => ({ id: uid('package'), name: '', kind: 'Mobile', amount: 0, portal: '', allowanceGb: 0, remainingGb: 0, expiresOn: '', updatedAt: '' });

export default function PackagesPage() {
  const { state, hydrated, savePackage, removePackage } = useNexus();
  const { label } = useCurrencyLabel();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [draft, setDraft] = useState<MonthlyPackage>(empty);
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('LKR');
  const [notice, setNotice] = useState('');
  const patch = (value: Partial<MonthlyPackage>) => setDraft((d) => ({ ...d, ...value }));
  const bills = state.transactions.filter((t) => t.packageId && t.billingMonth === month);
  return <>
    <header><p className="text-xs uppercase tracking-widest text-cyan-300">Monthly essentials</p><h1 className="mt-2 text-3xl font-bold">Subscriptions & mobile packages</h1><p className="mt-3 text-sm text-slate-400">Track packages, remaining data and bills in one place. Saved bills appear immediately in Finance’s charts and ledger.</p></header>
    <div className="glass flex flex-wrap items-center gap-4 p-5"><label>Billing month <input aria-label="Billing month" type="month" required className="input" value={month} onChange={(e) => { if(e.target.value) setMonth(e.target.value); }} /></label><p className="text-xl">Recorded this month: {label(bills.reduce((sum, t) => sum + t.amount, 0))}</p></div>
    <aside className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Usage is manually updated, not live. MyDialog and other mobile apps do not expose their private data to this website. Open your provider’s official portal or mobile app, then enter the current allowance and balance here. Live sync requires a supported, authorised provider API; never enter your provider password here.</aside>
    <form className="glass grid gap-4 p-5 md:grid-cols-3" onSubmit={(e) => {
      e.preventDefault();
      if (!hydrated || !month || draft.remainingGb > draft.allowanceGb) { setNotice('Remaining data cannot exceed the allowance.'); return; }
      savePackage({ ...draft, name: draft.name.trim(), amount: currency === 'LKR' ? draft.amount / 308 : draft.amount, updatedAt: new Date().toISOString() }, month);
      setDraft(empty()); setNotice('Saved. This month’s expense was added or updated without duplication.');
    }}>
      <h2 className="text-lg font-semibold md:col-span-3">{state.packages.some((p) => p.id === draft.id) ? 'Edit package / record bill' : 'Add package / record bill'}</h2>
      <label>Name<input className="input" required maxLength={120} value={draft.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Dialog monthly data" /></label>
      <label>Type<select className="input" value={draft.kind} onChange={(e) => patch({ kind: e.target.value as MonthlyPackage['kind'] })}>{['Mobile', 'Subscription', 'Utility'].map((v) => <option key={v}>{v}</option>)}</select></label>
      <label>Currency<select className="input" value={currency} onChange={(e) => { setCurrency(e.target.value as 'USD' | 'LKR'); patch({ amount: e.target.value === 'LKR' ? draft.amount * 308 : draft.amount / 308 }); }}><option>LKR</option><option>USD</option></select></label>
      <label>Monthly cost<input className="input" required type="number" min="0" step="0.01" value={draft.amount} onChange={(e) => patch({ amount: Number(e.target.value) })} /><span className="text-xs text-slate-500">Ledger uses USD; fixed conversion 308 LKR/USD.</span></label>
      <label>Data allowance (GB)<input className="input" type="number" min="0" step="0.01" value={draft.allowanceGb} onChange={(e) => patch({ allowanceGb: Number(e.target.value) })} /></label>
      <label>Remaining data (GB)<input className="input" type="number" min="0" max={draft.allowanceGb} step="0.01" value={draft.remainingGb} onChange={(e) => patch({ remainingGb: Number(e.target.value) })} /></label>
      <label>Expiry / renewal<input className="input" type="date" value={draft.expiresOn} onChange={(e) => patch({ expiresOn: e.target.value })} /></label>
      <label>Official provider portal (HTTPS)<input className="input" type="url" pattern="https://.*" placeholder="https://…" value={draft.portal} onChange={(e) => patch({ portal: e.target.value })} /></label>
      <div className="flex items-end gap-2"><button disabled={!hydrated} className="btn-primary">Save & record bill</button><button type="button" className="btn-ghost" onClick={() => setDraft(empty())}>Clear</button></div>
      <p role="status" className="text-sm text-cyan-200 md:col-span-3">{notice}</p>
    </form>
    <div className="grid gap-4 xl:grid-cols-2">{state.packages.map((item) => <article key={item.id} className="glass space-y-3 p-5">
      <div className="flex justify-between"><h2 className="font-semibold">{item.name}</h2><span>{label(item.amount)} / month</span></div>
      <p className="text-sm text-slate-400">{item.kind} · {item.expiresOn ? `Renewal / expiry ${item.expiresOn}` : 'No expiry set'}</p>
      {item.allowanceGb > 0 && <div><p>{item.remainingGb} GB remaining / {item.allowanceGb} GB</p><progress className="w-full" max={item.allowanceGb} value={item.remainingGb} aria-label={`${item.name} remaining data`} /></div>}
      <p className="text-xs text-slate-500">Manual update: {new Date(item.updatedAt).toLocaleString()} · {bills.some((b) => b.packageId === item.id) ? 'Bill recorded for selected month' : 'No bill recorded for selected month'}</p>
      <div className="flex flex-wrap gap-3">{item.portal.startsWith('https://') && <a className="btn-ghost" href={item.portal} target="_blank" rel="noreferrer">Open provider ↗</a>}<button className="btn-ghost" onClick={() => { setCurrency('USD'); setDraft({ ...item }); setNotice('Edit details then save to record or update the selected month.'); }}>Update / record month</button><button className="btn-ghost" onClick={() => { if(confirm('Remove package? Existing expenses will remain in Finance.')) removePackage(item.id); }}>Remove</button></div>
    </article>)}</div>
    {!state.packages.length && <p className="text-slate-400">No packages yet. Add your first mobile plan, subscription or utility above.</p>}
  </>;
}
