'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { BiometricDay } from '@/lib/types/health';
import { formatDuration } from '@/lib/parser/utils';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';

const STAGE_COLORS: Record<string, string> = {
  deep: '#a78bfa',
  light: '#38bdf8',
  rem: '#22d3ee',
  awake: '#fb7185',
};

function TooltipBox({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/12 bg-ink-900/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="mb-1 text-[10px] font-semibold text-slate-300">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-[10px]" style={{ color: p.color ?? '#cbd5e1' }}>
          {p.name}: {formatDuration(p.value)}
        </p>
      ))}
    </div>
  );
}

/** Sleep architecture monitor — deep / light / REM / awake across 7 nights. */
export function MedicalSleepMonitor({ biometrics }: { biometrics: BiometricDay[] }) {
  const nights = biometrics.slice(-7);
  const data = nights.map((b) => ({
    night: b.date.slice(5),
    deep: b.sleepSegments.find((s) => s.stage === 'deep')?.minutes ?? 0,
    light: b.sleepSegments.find((s) => s.stage === 'light')?.minutes ?? 0,
    rem: b.sleepSegments.find((s) => s.stage === 'rem')?.minutes ?? 0,
    awake: b.sleepSegments.find((s) => s.stage === 'awake')?.minutes ?? 0,
  }));

  const avg = nights.length
    ? nights.reduce((a, b) => a + b.sleepMinutes, 0) / nights.length
    : 0;
  const avgDeep = nights.length
    ? nights.reduce((a, b) => a + (b.sleepSegments.find((s) => s.stage === 'deep')?.minutes ?? 0), 0) /
      nights.length
    : 0;
  const avgScore = nights.length
    ? Math.round(nights.reduce((a, b) => a + b.sleepScore, 0) / nights.length)
    : 0;

  return (
    <GlassCard className="p-4" glow="violet">
      <SectionHeader
        eyebrow="Medical monitoring"
        title="Sleep architecture"
        action={
          <span className="chip border-nexus-violet/30 bg-nexus-violet/10 text-nexus-violet">
            avg score {avgScore}/100
          </span>
        }
      />

      <div className="mt-3 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.08)" vertical={false} />
            <XAxis
              dataKey="night"
              tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(148,163,184,0.6)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              unit="m"
            />
            <Tooltip content={<TooltipBox />} />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontSize: 10, paddingTop: 6 }}
            />
            <Bar dataKey="deep" stackId="s" name="Deep" fill={STAGE_COLORS.deep} />
            <Bar dataKey="light" stackId="s" name="Light" fill={STAGE_COLORS.light} />
            <Bar dataKey="rem" stackId="s" name="REM" fill={STAGE_COLORS.rem} />
            <Bar dataKey="awake" stackId="s" name="Awake" fill={STAGE_COLORS.awake} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Average duration', value: formatDuration(avg) },
          { label: 'Average deep sleep', value: formatDuration(avgDeep) },
          { label: 'Target', value: formatDuration(480) },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-soft px-3 py-2">
            <p className="label-caps">{kpi.label}</p>
            <p className="mt-1 font-mono text-sm font-semibold text-slate-100">{kpi.value}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
