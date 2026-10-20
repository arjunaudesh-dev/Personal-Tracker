'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { CashflowPoint, CategoryVariance } from '@/lib/types/finance';
import { formatCurrency } from '@/lib/parser/utils';

const AXIS = { stroke: 'rgba(148,163,184,0.5)', fontSize: 9 };

function AngledTick(props: { x?: number; y?: number; payload?: { value?: string } }) {
  const { x = 0, y = 0, payload } = props;
  return (
    <text
      x={x}
      y={y}
      dy={9}
      textAnchor="end"
      fill="rgba(148,163,184,0.55)"
      fontSize={9}
      transform={`rotate(-28 ${x} ${y})`}
    >
      {payload?.value ?? ''}
    </text>
  );
}
const GRID = 'rgba(148,163,184,0.10)';

function TooltipBox({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/12 bg-ink-900/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      {label ? <p className="mb-1 text-[10px] font-semibold text-slate-300">{label}</p> : null}
      {payload.map((entry, i) => (
        <p key={i} className="text-[10px]" style={{ color: entry.color ?? '#cbd5e1' }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

/** Needs / Wants / Savings donut with target threshold rings. */
export function BudgetDonutChart({
  breakdown,
  currency,
}: {
  breakdown: Array<{ bucket: string; actual: number; planned: number; ratio: number; color: string }>;
  currency: 'USD' | 'LKR';
}) {
  const data = breakdown.map((b) => ({
    name: b.bucket.charAt(0).toUpperCase() + b.bucket.slice(1),
    value: Math.round(b.actual),
    target: Math.round(b.planned),
    color: b.color,
  }));
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <div className="relative h-[210px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={52}
            outerRadius={78}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={
              <TooltipBox formatter={(v) => formatCurrency(v, currency, { compact: true })} />
            }
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-mono text-lg font-semibold text-slate-100">
          {formatCurrency(total, currency, { compact: true })}
        </p>
        <p className="text-[9px] uppercase tracking-widest text-slate-500">allocated</p>
      </div>
    </div>
  );
}

/** Weekly cashflow waterfall — inflow and outflow columns with a net line. */
export function CashflowWaterfall({
  series,
  currency,
}: {
  series: CashflowPoint[];
  currency: 'USD' | 'LKR';
}) {
  const data = series.map((p) => ({
    period: p.period,
    inflow: Math.round(p.inflow),
    outflow: Math.round(-p.outflow),
    net: Math.round(p.net),
    balance: Math.round(p.balance),
  }));

  return (
    <div className="h-[210px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="period" tick={AXIS} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}`} />
          <Tooltip
            content={
              <TooltipBox formatter={(v) => formatCurrency(Math.abs(v), currency, { compact: true })} />
            }
          />
          <ReferenceLine y={0} stroke="rgba(148,163,184,0.35)" />
          <Bar dataKey="inflow" name="Inflow" fill="#34d399" radius={[3, 3, 0, 0]} barSize={14} />
          <Bar dataKey="outflow" name="Outflow" fill="#fb7185" radius={[0, 0, 3, 3]} barSize={14} />
          <Line
            type="monotone"
            dataKey="balance"
            name="Balance"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Planned vs actual by spending category. */
export function CategoryVarianceChart({
  variance,
  currency,
}: {
  variance: CategoryVariance[];
  currency: 'USD' | 'LKR';
}) {
  const data = variance.slice(0, 8).map((v) => ({
    category: v.category.length > 16 ? `${v.category.slice(0, 15)}…` : v.category,
    planned: Math.round(v.planned),
    actual: Math.round(v.actual),
  }));

  return (
    <div className="h-[210px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis
            dataKey="category"
            tick={<AngledTick />}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} />
          <Tooltip
            content={
              <TooltipBox formatter={(v) => formatCurrency(v, currency, { compact: true })} />
            }
          />
          <Bar dataKey="planned" name="Planned" fill="rgba(34,211,238,0.35)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="actual" name="Actual" fill="#a78bfa" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
