'use client';

import { Activity, HeartPulse, Moon } from 'lucide-react';

import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';
import { dailyOutflow, telemetrySeries } from '@/store/nexus-selectors';

import { OutflowVelocityChart, SleepHeartChart } from './TelemetryCharts';
import { QuickCaptureBar } from './QuickCaptureBar';

/** Column 3 — telemetry sparklines, outflow velocity and the quick capture bar. */
export function BriefingTelemetryColumn() {
  const { state, dispatch } = useNexus();

  const series = telemetrySeries(state.biometrics, 7);
  const outflow = dailyOutflow(state.transactions, 7);
  const latest = state.biometrics[state.biometrics.length - 1];

  return (
    <GlassCard className="flex h-full flex-col p-4" glow="emerald">
      <SectionHeader
        eyebrow="Column 03"
        title="Telemetry & quick capture"
        action={
          <span className="chip border-nexus-emerald/30 bg-nexus-emerald/10 text-nexus-emerald">
            live
          </span>
        }
      />

      <section className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <Moon className="h-3 w-3 text-nexus-violet" />
            7-day sleep vs resting HR
          </p>
          <span className="font-mono text-[10px] text-slate-500">
            {latest?.sleepScore ?? 0}/100 · {latest?.restingHr ?? 0} bpm
          </span>
        </div>
        <SleepHeartChart series={series} />
      </section>

      <section className="mt-3 border-t border-white/[0.07] pt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            <Activity className="h-3 w-3 text-nexus-amber" />
            7-day outflow velocity
          </p>
          <div className="flex gap-0.5">
            {(['USD', 'LKR'] as const).map((code) => (
              <button
                key={code}
                onClick={() => dispatch({ type: 'set-currency', currency: code })}
                className={`rounded-md border px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
                  state.currency === code
                    ? 'border-nexus-amber/45 bg-nexus-amber/12 text-nexus-amber'
                    : 'border-white/10 text-slate-600 hover:text-slate-400'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
        <OutflowVelocityChart data={outflow} currency={state.currency} />
      </section>

      <section className="mt-3 border-t border-white/[0.07] pt-3">
        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <HeartPulse className="h-3 w-3 text-nexus-rose" />
          3-second quick capture
        </p>
        <QuickCaptureBar />
      </section>
    </GlassCard>
  );
}
