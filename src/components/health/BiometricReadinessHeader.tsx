'use client';

import { Activity, Droplets, HeartPulse, Moon, Scale } from 'lucide-react';

import type { BiometricDay } from '@/lib/types/health';
import { OPERATOR_PROFILE } from '@/lib/config/profile';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { Sparkline } from '@/components/ui/Sparkline';

function Metric({
  icon: Icon,
  label,
  value,
  unit,
  tone,
  detail,
  trend,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  unit: string;
  tone: string;
  detail: string;
  trend: number[];
}) {
  return (
    <div className="glass-soft flex items-center gap-3 p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] ${tone}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="label-caps">{label}</p>
        <p className="mt-0.5 font-mono text-lg font-semibold leading-none text-slate-100">
          {value}
          <span className="ml-1 text-[10px] font-normal text-slate-500">{unit}</span>
        </p>
        <p className="mt-1 text-[10px] text-slate-500">{detail}</p>
      </div>
      <div className="w-16 shrink-0">
        <Sparkline data={trend} color="#22d3ee" height={28} width={64} />
      </div>
    </div>
  );
}

/** Readiness header — sleep, HR recovery, weight and hydration at a glance. */
export function BiometricReadinessHeader({
  biometrics,
  readiness,
}: {
  biometrics: BiometricDay[];
  readiness: number;
}) {
  const latest = biometrics[biometrics.length - 1];
  const previous = biometrics[biometrics.length - 2];
  if (!latest) return null;

  const hrDelta = previous ? latest.restingHr - previous.restingHr : 0;
  const sleepTrend = biometrics.slice(-8).map((b) => b.sleepScore);
  const hrTrend = biometrics.slice(-8).map((b) => b.restingHr);
  const weightTrend = biometrics.slice(-8).map((b) => b.weightKg);
  const hydrationTrend = biometrics.slice(-8).map((b) => b.hydrationMl);

  return (
    <GlassCard className="p-4" glow="emerald">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="label-caps">Telemetry · {latest.date}</p>
          <h3 className="text-sm font-semibold tracking-tight text-slate-100">
            Biometric readiness header
          </h3>
          <p className="mt-1 text-[10.5px] text-slate-500">
            Source: {latest.source === 'simulated' ? 'Mi Band / Mibro GT simulation' : latest.source} ·
            {latest.steps.toLocaleString()} steps · {latest.caloriesBurned.toLocaleString()} kcal burned
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ProgressRing
            value={readiness}
            size={64}
            stroke={6}
            tone={readiness >= 75 ? 'emerald' : readiness >= 55 ? 'amber' : 'rose'}
            sublabel="readiness"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={Moon}
          label="Sleep score"
          value={String(latest.sleepScore)}
          unit="/100"
          tone="text-nexus-violet"
          detail={`${Math.floor(latest.sleepMinutes / 60)}h ${latest.sleepMinutes % 60}m total`}
          trend={sleepTrend}
        />
        <Metric
          icon={HeartPulse}
          label="Resting HR"
          value={String(latest.restingHr)}
          unit="bpm"
          tone="text-nexus-rose"
          detail={hrDelta === 0 ? 'stable overnight' : `${hrDelta > 0 ? '+' : ''}${hrDelta} bpm vs yesterday`}
          trend={hrTrend}
        />
        <Metric
          icon={Scale}
          label="Body mass"
          value={latest.weightKg.toFixed(1)}
          unit="kg"
          tone="text-nexus-cyan"
          detail={`${latest.bodyFatPct.toFixed(1)}% body fat`}
          trend={weightTrend}
        />
        <Metric
          icon={Droplets}
          label="Hydration"
          value={String(latest.hydrationMl)}
          unit="ml"
          tone="text-nexus-sky"
          detail={`target ${OPERATOR_PROFILE.hydrationTargetMl.toLocaleString()} ml`}
          trend={hydrationTrend}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {[
          { label: 'Daily steps', value: latest.steps, target: OPERATOR_PROFILE.stepTarget, tone: 'cyan' as const },
          {
            label: 'Active calories',
            value: latest.caloriesBurned - 1650,
            target: 600,
            tone: 'amber' as const,
          },
          {
            label: 'Sleep duration',
            value: latest.sleepMinutes,
            target: OPERATOR_PROFILE.sleepTargetMin,
            tone: 'violet' as const,
          },
        ].map((row) => (
          <div key={row.label} className="glass-soft px-3 py-2">
            <div className="mb-1.5 flex items-center justify-between text-[10px]">
              <span className="text-slate-500">{row.label}</span>
              <span className="font-mono text-slate-300">
                {Math.round(row.value)} / {row.target}
              </span>
            </div>
            <ProgressBar value={(row.value / row.target) * 100} tone={row.tone} height={4} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
