'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { bestOneRepMaxByExercise, oneRepMax } from '@/lib/health';
import { todayISO } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import type { WorkoutSet } from '@/types/nexus';

const SPLITS: WorkoutSet['split'][] = ['Push', 'Pull', 'Legs', 'Civil Conditioning'];

export function WorkoutLogger() {
  const { state, addWorkout } = useNexus();
  const [f, setF] = useState({ exercise: '', split: 'Push' as WorkoutSet['split'], sets: '3', reps: '8', weightKg: '40', rpe: '8' });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));
  const preview = oneRepMax(Number(f.weightKg) || 0, Number(f.reps) || 0);

  const best = useMemo(() => Object.entries(bestOneRepMaxByExercise(state.workouts)).sort((a, b) => b[1] - a[1]), [state.workouts]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.exercise.trim()) return;
    addWorkout({ date: todayISO(), exercise: f.exercise.trim(), split: f.split, sets: Number(f.sets) || 1, reps: Number(f.reps) || 1, weightKg: Number(f.weightKg) || 0, rpe: Number(f.rpe) || 0 });
    set('exercise', '');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Workout logger" subtitle="Push · Pull · Legs · Civil conditioning">
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="col-span-2"><label className="label" htmlFor="wk-ex">Exercise</label><input id="wk-ex" className="input" value={f.exercise} onChange={(e) => set('exercise', e.target.value)} placeholder="Incline Dumbbell Press" /></div>
          <div><label className="label" htmlFor="wk-split">Split</label><select id="wk-split" className="input" value={f.split} onChange={(e) => set('split', e.target.value)}>{SPLITS.map((s) => <option key={s}>{s}</option>)}</select></div>
          <div><label className="label" htmlFor="wk-sets">Sets</label><input id="wk-sets" type="number" min={1} className="input" value={f.sets} onChange={(e) => set('sets', e.target.value)} /></div>
          <div><label className="label" htmlFor="wk-reps">Reps</label><input id="wk-reps" type="number" min={1} className="input" value={f.reps} onChange={(e) => set('reps', e.target.value)} /></div>
          <div><label className="label" htmlFor="wk-kg">Weight (kg)</label><input id="wk-kg" type="number" min={0} step="0.5" className="input" value={f.weightKg} onChange={(e) => set('weightKg', e.target.value)} /></div>
          <div><label className="label" htmlFor="wk-rpe">RPE (1–10)</label><input id="wk-rpe" type="number" min={1} max={10} step="0.5" className="input" value={f.rpe} onChange={(e) => set('rpe', e.target.value)} /></div>
          <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-3">
            <p className="text-xs text-slate-400">Estimated 1RM (Epley): <span className="font-semibold text-cyan-300">{preview} kg</span></p>
            <button className="btn-primary" type="submit"><Plus className="h-4 w-4" /> Log set</button>
          </div>
        </form>
      </Card>

      <Card title="Estimated 1RM leaderboard" subtitle="Best Epley estimate per lift">
        <ul className="space-y-2">
          {best.slice(0, 8).map(([ex, v], i) => (
            <li key={ex} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2">
              <span className="w-5 text-xs text-slate-500">{i + 1}</span>
              <span className="flex-1 text-sm">{ex}</span>
              <span className="font-semibold tabular-nums text-violet-200">{v} kg</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[11px] text-slate-500">Recent sets</p>
        <ul className="mt-2 space-y-1 text-xs text-slate-400">
          {state.workouts.slice(0, 5).map((w) => <li key={w.id}>{w.date.slice(5)} · {w.split} · {w.exercise} {w.sets}×{w.reps} @ {w.weightKg}kg (RPE {w.rpe})</li>)}
        </ul>
      </Card>
    </div>
  );
}
