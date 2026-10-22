'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { macroTargets } from '@/lib/health';
import { todayISO } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function NutritionCard({ burnToday }: { burnToday: number }) {
  const { state, addMeal } = useNexus();
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const today = state.meals.filter((m) => m.date === todayISO());
  const eaten = today.reduce((s, m) => s + m.calories, 0);
  const protTotal = today.reduce((s, m) => s + m.protein, 0);
  const target = macroTargets(state.profile, burnToday);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !(Number(kcal) >= 0)) return;
    addMeal({ date: todayISO(), name: name.trim(), calories: Number(kcal), protein: Number(protein) || 0 });
    setName(''); setKcal(''); setProtein('');
  };

  return (
    <Card title="Nutrition today" subtitle="Log meals — the target shifts with workouts">
      <div className="mb-1 flex justify-between text-xs text-slate-400"><span>Calories</span><span className="text-slate-200">{eaten} / {target.kcal} kcal</span></div>
      <ProgressBar value={(eaten / target.kcal) * 100} />
      <div className="mb-1 mt-4 flex justify-between text-xs text-slate-400"><span>Protein</span><span className="text-slate-200">{protTotal} / {target.protein} g</span></div>
      <ProgressBar value={(protTotal / target.protein) * 100} />

      <ul className="mt-4 space-y-2">
        {today.map((m) => (
          <li key={m.id} className="flex justify-between rounded-xl bg-white/[0.03] px-3 py-2 text-sm"><span>{m.name}</span><span className="text-slate-400">{m.calories} kcal · {m.protein} g P</span></li>
        ))}
        {today.length === 0 && <li className="text-xs text-slate-500">Nothing logged yet today.</li>}
      </ul>

      <form onSubmit={submit} className="mt-4 grid grid-cols-[1fr_80px_80px_auto] gap-2">
        <input className="input" placeholder="Meal" value={name} onChange={(e) => setName(e.target.value)} aria-label="Meal name" />
        <input className="input" type="number" min={0} placeholder="kcal" value={kcal} onChange={(e) => setKcal(e.target.value)} aria-label="Calories" />
        <input className="input" type="number" min={0} placeholder="protein g" value={protein} onChange={(e) => setProtein(e.target.value)} aria-label="Protein grams" />
        <button className="btn-primary !px-3" type="submit" aria-label="Log meal"><Plus className="h-4 w-4" /></button>
      </form>
    </Card>
  );
}
