'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { formatCurrency } from '@/lib/parser/utils';

const AXIS = { fill: 'rgba(148,163,184,0.55)', fontSize: 9 };

function Tip({ active, payload, label, unit, formatter }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
  unit?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/12 bg-ink-900/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-[10px] font-semibold text-slate-300">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[10px]" style={{ color: p.color ?? '#cbd5e1' }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
          {unit}
        </p>
      ))}
    </div>
  );
}

/** Dual-axis sleep score vs resting heart-rate area chart. */
export function SleepHeartChart({
  series,
}: {
  series: Array<{ day: string; sleep: number; restingHr: number }>;
}) {
  return (
    <div className="h-[132px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={series} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
          <defs>
            <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} domain={[40, 100]} />
          <Tooltip content={<Tip />} />
          <Area
            type="monotone"
            dataKey="sleep"
            name="Sleep"
            stroke="#a78bfa"
            strokeWidth={2}
            fill="url(#sleepGrad)"
          />
          <Area
            type="monotone"
            dataKey="restingHr"
            name="Resting HR"
            stroke="#22d3ee"
            strokeWidth={2}
            fill="url(#hrGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** 7-day outflow velocity bar chart with an instant currency toggle. */
export function OutflowVelocityChart({
  data,
  currency,
}: {
  data: Array<{ day: string; amount: number }>;
  currency: 'USD' | 'LKR';
}) {
  return (
    <div className="h-[110px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 4, left: -26, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis dataKey="day" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip
            content={<Tip formatter={(v) => formatCurrency(v, currency, { compact: true })} />}
          />
          <Bar dataKey="amount" name="Outflow" fill="#fbbf24" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
