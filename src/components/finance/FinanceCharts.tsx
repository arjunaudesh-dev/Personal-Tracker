'use client';

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cashflowSeries, categoryVariance, type BucketSummary } from '@/lib/budget';
import { useNexus } from '@/lib/store';
import { useCurrencyLabel } from '@/lib/currency';

const TIP = { contentStyle: { background: '#0a0d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 } };
const BUCKET_COLORS = { needs: '#22d3ee', wants: '#a78bfa', savings: '#a3e635' };

export function CashflowArea() {
  const { state } = useNexus();
  const { label } = useCurrencyLabel();
  const data = cashflowSeries(state.transactions);
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} /><stop offset="100%" stopColor="#22d3ee" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={70} tickFormatter={(v: number) => label(v)} />
          <Tooltip {...TIP} formatter={(v: number) => [label(v), 'Net cash']} />
          <Area type="monotone" dataKey="net" stroke="#22d3ee" strokeWidth={2.5} fill="url(#cf)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BucketDonut({ summary }: { summary: BucketSummary[] }) {
  const data = summary.map((s) => ({ name: s.bucket, value: s.targetPct, actual: s.actualPct }));
  return (
    <div className="grid items-center gap-4 md:grid-cols-2">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={BUCKET_COLORS[d.name as keyof typeof BUCKET_COLORS]} />)}
            </Pie>
            <Tooltip {...TIP} formatter={(v: number, n: string) => [`${v}% target`, n]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-3">
        {summary.map((s) => (
          <li key={s.bucket}>
            <div className="flex justify-between text-xs"><span className="capitalize text-slate-300">{s.bucket}</span><span className="text-slate-400">target {s.targetPct}% · actual {s.actualPct}%</span></div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, s.actualPct)}%`, background: BUCKET_COLORS[s.bucket] }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PlannedVsActual() {
  const { state } = useNexus();
  const { convert, currency } = useCurrencyLabel();
  const data = categoryVariance(state.transactions).map((r) => ({ category: r.category, Planned: Math.round(convert(r.planned)), Actual: Math.round(convert(r.actual)) }));
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
          <Tooltip {...TIP} formatter={(v: number) => [`${v.toLocaleString()} ${currency}`]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Planned" fill="rgba(148,163,184,0.45)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Actual" fill="url(#pa)" radius={[6, 6, 0, 0]} />
          <defs><linearGradient id="pa" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient></defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
