'use client';

import { Activity, Bike, Footprints, HeartPulse, PersonStanding } from 'lucide-react';

import type { BiometricDay } from '@/lib/types/health';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';

const SPLITS = [
  { day: 'Mon', split: 'Push — Hypertrophy', focus: 'Chest · shoulders · triceps', done: true },
  { day: 'Tue', split: 'Pull — Hypertrophy', focus: 'Back · rear delts · biceps', done: true },
  { day: 'Wed', split: 'Conditioning', focus: 'Loaded carry · step-ups · grip', done: true },
  { day: 'Thu', split: 'Legs — Strength', focus: 'Squat · RDL · press · calves', done: true },
  { day: 'Fri', split: 'Rest + mobility', focus: 'Hip flexor · thoracic', done: false },
  { day: 'Sat', split: 'Push — Volume', focus: 'Deload tempo work', done: false },
  { day: 'Sun', split: 'Zone 2 cardio', focus: '30 min · 140–150 bpm', done: false },
];

const ZONES = [
  { zone: 'Z1 Recovery', range: '95–115 bpm', pct: '50–60% HRmax', tone: 'text-slate-400', bg: 'bg-slate-500/15' },
  { zone: 'Z2 Aerobic', range: '115–140 bpm', pct: '60–70% HRmax', tone: 'text-nexus-cyan', bg: 'bg-nexus-cyan/15' },
  { zone: 'Z3 Tempo', range: '140–155 bpm', pct: '70–80% HRmax', tone: 'text-nexus-emerald', bg: 'bg-nexus-emerald/15' },
  { zone: 'Z4 Threshold', range: '155–170 bpm', pct: '80–90% HRmax', tone: 'text-nexus-amber', bg: 'bg-nexus-amber/15' },
  { zone: 'Z5 VO₂max', range: '170+ bpm', pct: '90–100% HRmax', tone: 'text-nexus-rose', bg: 'bg-nexus-rose/15' },
];

/** Split schedule, cardio zones and weekly load distribution. */
export function GymCardioPlanner({ biometrics }: { biometrics: BiometricDay[] }) {
  const latest = biometrics[biometrics.length - 1];
  const hrMax = latest?.maxHr ?? 188;
  const resting = latest?.restingHr ?? 56;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <GlassCard className="p-4 xl:col-span-2" glow="cyan">
        <SectionHeader
          eyebrow="Block 4 · hypertrophy"
          title="Training split schedule"
          action={
            <span className="chip border-nexus-cyan/30 bg-nexus-cyan/10 text-nexus-cyan">
              4 sessions / week
            </span>
          }
        />
        <ul className="mt-3 space-y-1.5">
          {SPLITS.map((s) => (
            <li
              key={s.day}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                s.done
                  ? 'border-nexus-emerald/20 bg-nexus-emerald/[0.05]'
                  : 'border-white/[0.07] bg-white/[0.02]'
              }`}
            >
              <span className="w-8 shrink-0 font-mono text-[10px] text-slate-500">{s.day}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11.5px] font-medium text-slate-200">{s.split}</p>
                <p className="truncate text-[10px] text-slate-500">{s.focus}</p>
              </div>
              <span
                className={`chip ${
                  s.done
                    ? 'border-nexus-emerald/30 bg-nexus-emerald/10 text-nexus-emerald'
                    : 'border-white/10 text-slate-500'
                }`}
              >
                {s.done ? 'complete' : 'planned'}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard className="p-4" glow="rose">
        <SectionHeader eyebrow="Cardio" title="Heart-rate zones" />
        <div className="mt-3 space-y-1.5">
          {ZONES.map((z) => (
            <div
              key={z.zone}
              className={`rounded-xl border border-transparent px-3 py-2 ${z.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${z.tone}`}>{z.zone}</span>
                <span className="font-mono text-[10px] text-slate-400">{z.range}</span>
              </div>
              <p className="mt-0.5 text-[9.5px] text-slate-500">{z.pct}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
          <p className="label-caps">Derived from telemetry</p>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">HR max (observed)</span>
            <span className="font-mono text-slate-200">{hrMax} bpm</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Resting HR</span>
            <span className="font-mono text-slate-200">{resting} bpm</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Zone 2 target</span>
            <span className="font-mono text-nexus-cyan">
              {Math.round(resting + (hrMax - resting) * 0.6)}–{Math.round(resting + (hrMax - resting) * 0.7)} bpm
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 xl:col-span-3" glow="emerald">
        <SectionHeader eyebrow="Civil work conditioning" title="Site-matched conditioning & weekly load" />
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            { icon: PersonStanding, label: 'Loaded carry', value: '60 kg × 40 m', tone: 'text-nexus-cyan' },
            { icon: Footprints, label: 'Step-up', value: '24 kg × 12', tone: 'text-nexus-emerald' },
            { icon: Activity, label: 'Grip endurance', value: '45 s hang', tone: 'text-nexus-amber' },
            { icon: Bike, label: 'Zone 2 cardio', value: '30 min · 140 bpm', tone: 'text-nexus-violet' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="glass-soft flex items-center gap-2.5 px-3 py-2.5">
                <Icon className={`h-4 w-4 shrink-0 ${item.tone}`} />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500">{item.label}</p>
                  <p className="truncate text-[11.5px] font-medium text-slate-200">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Weekly training volume (sets)</span>
            <span className="font-mono text-slate-300">21 / 24 target</span>
          </div>
          <ProgressBar value={87.5} tone="emerald" height={5} />
        </div>
      </GlassCard>
    </div>
  );
}
