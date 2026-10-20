'use client';

import { Calculator, Check, Dumbbell, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { WorkoutSession } from '@/lib/types/health';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { ProgressBar } from '@/components/ui/Progress';
import { useNexus } from '@/store/nexus-store';

/** Epley estimated one-rep-max: 1RM = weight × (1 + reps / 30). */
export function estimateOneRepMax(weightKg: number, reps: number) {
  return Math.round(weightKg * (1 + reps / 30));
}

const EXERCISES: Array<{ name: string; equipment: string; split: string }> = [
  { name: 'Barbell Bench Press', equipment: 'Barbell', split: 'Push' },
  { name: 'Incline Dumbbell Press', equipment: 'Dumbbell', split: 'Push' },
  { name: 'Overhead Press', equipment: 'Barbell', split: 'Push' },
  { name: 'Weighted Pull-Up', equipment: 'Bodyweight', split: 'Pull' },
  { name: 'Barbell Row', equipment: 'Barbell', split: 'Pull' },
  { name: 'Lat Pulldown', equipment: 'Cable', split: 'Pull' },
  { name: 'Back Squat', equipment: 'Barbell', split: 'Legs' },
  { name: 'Romanian Deadlift', equipment: 'Barbell', split: 'Legs' },
  { name: 'Leg Press', equipment: 'Machine', split: 'Legs' },
];

/** Interactive set logger with RPE tracking and 1RM maths. */
export function GymCoachAndEquipment({
  workouts,
}: {
  workouts: WorkoutSession[];
}) {
  const { dispatch } = useNexus();
  const [selected, setSelected] = useState(workouts[0]?.id ?? '');
  const session = workouts.find((w) => w.id === selected) ?? workouts[0];

  const bestLifts = useMemo(() => {
    const map = new Map<string, { weight: number; reps: number; rm: number }>();
    workouts.forEach((w) =>
      w.sets.forEach((s) => {
        const rm = estimateOneRepMax(s.weightKg, s.reps);
        const current = map.get(s.exercise);
        if (!current || rm > current.rm) {
          map.set(s.exercise, { weight: s.weightKg, reps: s.reps, rm });
        }
      }),
    );
    return Array.from(map.entries()).slice(0, 6);
  }, [workouts]);

  if (!session) return null;

  return (
    <GlassCard className="p-4" glow="rose">
      <SectionHeader
        eyebrow="Hypertrophy block 4"
        title="Gym coach & equipment"
        action={
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="input w-auto py-1 text-[10px]"
          >
            {workouts.map((w) => (
              <option key={w.id} value={w.id}>
                {w.date} — {w.title}
              </option>
            ))}
          </select>
        }
      />

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10.5px] text-slate-500">
        <span className="chip border-nexus-rose/30 bg-nexus-rose/10 text-nexus-rose">{session.split}</span>
        <span>{session.durationMin} minutes</span>
        <span>·</span>
        <span>{session.calories} kcal</span>
        <span>·</span>
        <span>{session.sets.length} working sets</span>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/[0.07]">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-white/[0.04] text-[9px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2 font-semibold">Exercise</th>
              <th className="px-2 py-2 font-semibold">Set</th>
              <th className="px-2 py-2 font-semibold">Reps</th>
              <th className="px-2 py-2 font-semibold">Load</th>
              <th className="px-2 py-2 font-semibold">RPE</th>
              <th className="px-2 py-2 font-semibold">Est. 1RM</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {session.sets.map((set) => (
              <tr key={set.id} className="border-t border-white/[0.05]">
                <td className="px-3 py-1.5 text-slate-200">{set.exercise}</td>
                <td className="px-2 py-1.5 font-mono text-slate-500">{set.setNo}</td>
                <td className="px-2 py-1.5 font-mono text-slate-400">{set.reps}</td>
                <td className="px-2 py-1.5 font-mono text-slate-400">{set.weightKg} kg</td>
                <td className="px-2 py-1.5 font-mono text-nexus-amber">{set.rpe}</td>
                <td className="px-2 py-1.5 font-mono text-nexus-cyan">
                  {estimateOneRepMax(set.weightKg, set.reps)} kg
                </td>
                <td className="px-2 py-1.5 text-right">
                  <button
                    onClick={() => dispatch({ type: 'toggle-set', sessionId: session.id, setId: set.id })}
                    className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                      set.completed
                        ? 'border-nexus-emerald bg-nexus-emerald/25 text-nexus-emerald'
                        : 'border-white/15 text-transparent hover:border-nexus-cyan/60'
                    }`}
                    aria-label="Toggle set"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <section className="glass-soft p-3">
          <div className="flex items-center gap-1.5">
            <Calculator className="h-3.5 w-3.5 text-nexus-cyan" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-cyan">
              Estimated 1RM (Epley)
            </p>
          </div>
          <ul className="mt-2 space-y-1.5">
            {bestLifts.map(([exercise, lift]) => (
              <li key={exercise} className="flex items-center justify-between text-[11px]">
                <span className="min-w-0 flex-1 truncate text-slate-300">{exercise}</span>
                <span className="font-mono text-slate-500">
                  {lift.weight} kg × {lift.reps} →{' '}
                  <span className="text-nexus-cyan">{lift.rm} kg</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-soft p-3">
          <div className="flex items-center gap-1.5">
            <Dumbbell className="h-3.5 w-3.5 text-nexus-violet" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-violet">
              Exercise library
            </p>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-1">
            {EXERCISES.map((ex) => (
              <li
                key={ex.name}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5 text-[10px] text-slate-400"
              >
                <span className="h-1 w-1 rounded-full bg-nexus-violet" />
                <span className="min-w-0 flex-1 truncate">{ex.name}</span>
                <span className="text-[8.5px] text-slate-600">{ex.equipment}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Session completion</span>
          <span className="font-mono text-slate-300">
            {session.sets.filter((s) => s.completed).length}/{session.sets.length} sets
          </span>
        </div>
        <ProgressBar
          value={
            session.sets.length
              ? (session.sets.filter((s) => s.completed).length / session.sets.length) * 100
              : 0
          }
          tone="rose"
          height={5}
        />
      </div>
    </GlassCard>
  );
}

/** 1RM calculator panel. */
export function OneRepMaxCalculator() {
  const [weight, setWeight] = useState('82.5');
  const [reps, setReps] = useState('8');
  const rm = estimateOneRepMax(Number(weight) || 0, Number(reps) || 0);

  return (
    <GlassCard className="p-4" glow="amber">
      <SectionHeader eyebrow="Strength" title="1RM calculator" />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="label-caps mb-1">Weight (kg)</p>
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            type="number"
            className="input"
          />
        </div>
        <div>
          <p className="label-caps mb-1">Reps</p>
          <input
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            type="number"
            className="input"
          />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl border border-nexus-amber/25 bg-nexus-amber/[0.08] px-3 py-2.5">
        <span className="text-[11px] text-slate-300">Estimated 1RM</span>
        <span className="font-mono text-lg font-semibold text-nexus-amber">{rm} kg</span>
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        1RM = Weight × (1 + Reps ÷ 30). Use 95 % of this value for hypertrophy working sets.
      </p>
    </GlassCard>
  );
}
