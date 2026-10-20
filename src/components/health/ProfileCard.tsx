'use client';

import { useNexus } from '@/lib/store';
import { bmr, calorieTarget, macroTargets, tdee } from '@/lib/health';
import { Card } from '@/components/ui/Card';
import type { Profile } from '@/types/nexus';

const ACTIVITY = [
  { v: 1.2, l: 'Sedentary (desk)' }, { v: 1.375, l: 'Light (1–3 d/wk)' }, { v: 1.55, l: 'Moderate (3–5 d/wk)' }, { v: 1.725, l: 'Very active' }, { v: 1.9, l: 'Site labour + gym' },
];

export function ProfileCard({ burnToday }: { burnToday: number }) {
  const { state, setProfile } = useNexus();
  const p = state.profile;
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setProfile({ [k]: Number(e.target.value) } as Partial<Profile>);
  const m = macroTargets(p, burnToday);

  return (
    <Card title="Body & energy model" subtitle="Mifflin–St Jeor BMR × activity, shifted by goal">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="pf-sex">Sex</label><select id="pf-sex" className="input" value={p.sex} onChange={(e) => setProfile({ sex: e.target.value as Profile['sex'] })}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className="label" htmlFor="pf-age">Age</label><input id="pf-age" type="number" className="input" value={p.age} onChange={num('age')} /></div>
        <div><label className="label" htmlFor="pf-h">Height (cm)</label><input id="pf-h" type="number" className="input" value={p.heightCm} onChange={num('heightCm')} /></div>
        <div><label className="label" htmlFor="pf-w">Weight (kg)</label><input id="pf-w" type="number" className="input" value={p.weightKg} onChange={num('weightKg')} /></div>
        <div className="col-span-2"><label className="label" htmlFor="pf-act">Activity</label>
          <select id="pf-act" className="input" value={p.activity} onChange={(e) => setProfile({ activity: Number(e.target.value) })}>
            {ACTIVITY.map((a) => <option key={a.v} value={a.v}>{a.l} · ×{a.v}</option>)}
          </select></div>
        <div className="col-span-2"><p className="label">Goal</p>
          <div className="flex gap-2">
            {(['cut', 'maintain', 'bulk'] as const).map((g) => (
              <button key={g} type="button" onClick={() => setProfile({ goal: g })} className={`flex-1 rounded-xl border px-3 py-2 text-xs capitalize transition ${p.goal === g ? 'border-cyan-400/50 bg-cyan-400/10 text-white' : 'border-white/10 text-slate-400 hover:text-slate-200'}`}>{g}</button>
            ))}
          </div></div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-center">
        <Stat label="BMR" value={`${bmr(p)}`} unit="kcal" />
        <Stat label="TDEE" value={`${tdee(p, burnToday)}`} unit="kcal" />
        <Stat label="Target" value={`${calorieTarget(p, burnToday)}`} unit="kcal" tone="text-cyan-300" />
        <Stat label="Protein floor" value={`${m.protein}`} unit="g" tone="text-lime-300" />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-white/5 p-2"><p className="text-slate-400">Carbs</p><p className="font-semibold">{m.carbs} g</p></div>
        <div className="rounded-xl bg-white/5 p-2"><p className="text-slate-400">Fat</p><p className="font-semibold">{m.fat} g</p></div>
        <div className="rounded-xl bg-white/5 p-2"><p className="text-slate-400">Gym burn</p><p className="font-semibold">+{burnToday} kcal</p></div>
      </div>
    </Card>
  );
}

function Stat({ label, value, unit, tone = 'text-slate-100' }: { label: string; value: string; unit: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${tone}`}>{value}<span className="ml-1 text-xs font-normal text-slate-500">{unit}</span></p>
    </div>
  );
}
