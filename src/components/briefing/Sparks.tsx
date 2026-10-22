'use client';

import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
import { useNexus } from '@/lib/store';
import { useCurrencyLabel } from '@/lib/currency';
import { daysAgoISO, LKR_PER_USD } from '@/lib/utils';

const TOOLTIP = { contentStyle: { background: '#0a0d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 } };

/** Seven-day sleep vs resting heart-rate sparkline (sample wearable telemetry). */
export function SleepHrSpark() {
  const { state } = useNexus();
  const data = Array.from({ length: 7 }, (_, i) => {
    const day = 6 - i;
    return { day: daysAgoISO(day).slice(5), sleep: Math.round(6.4 + ((i * 37) % 9) / 10 + (i === 6 ? 0.6 : 0)), rhr: 58 + ((i * 5) % 4) - (i === 6 ? 2 : 0) };
  });
  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[5, 9]} />
          <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[50, 70]} />
          <Tooltip {...TOOLTIP} />
          <Line yAxisId="l" type="monotone" dataKey="sleep" name="Sleep (h)" stroke="#a78bfa" strokeWidth={2} dot={false} />
          <Line yAxisId="r" type="monotone" dataKey="rhr" name="Resting HR" stroke="#f472b6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-slate-500">Sleep score {state.sleepScore}/100 · resting HR baseline 58 bpm</p>
    </div>
  );
}

/** Seven-day outflow bars with a live USD / LKR toggle. */
export function OutflowBars() {
  const { state } = useNexus();
  const { label, convert } = useCurrencyLabel();
  const data = Array.from({ length: 7 }, (_, i) => {
    const day = daysAgoISO(6 - i);
    const usd = state.transactions.filter((t) => t.type === 'expense' && t.date === day).reduce((s, t) => s + t.amount, 0);
    return { day: day.slice(5), value: Math.round(convert(usd)) };
  });
  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip {...TOOLTIP} formatter={(v: number) => [`${label(v)}`, 'Outflow']} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22d3ee" /><stop offset="100%" stopColor="#7c3aed" /></linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-1 text-[11px] text-slate-500">Standard rate {LKR_PER_USD} LKR / USD</p>
    </div>
  );
}

export function BurnArea() {
  const { state } = useNexus();
  const { convert } = useCurrencyLabel();
  const perDay = state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) / 30;
  const data = Array.from({ length: 14 }, (_, i) => ({ d: i + 1, v: Math.round(convert(perDay * (1 + Math.sin(i / 2) * 0.15) * (i + 1))) }));
  return (
    <div className="h-28">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs><linearGradient id="burn" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f472b6" stopOpacity={0.5} /><stop offset="100%" stopColor="#f472b6" stopOpacity={0} /></linearGradient></defs>
          <Area type="monotone" dataKey="v" stroke="#f472b6" fill="url(#burn)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
