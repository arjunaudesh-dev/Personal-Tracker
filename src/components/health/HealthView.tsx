'use client';

import { useMemo } from 'react';
import { Dumbbell, Flame, HeartPulse, Moon } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { estimateSessionBurn } from '@/lib/health';
import { todayISO } from '@/lib/utils';
import { PageHeader } from '@/components/ui/PageHeader';
import { Kpi } from '@/components/ui/Kpi';
import { ProfileCard } from './ProfileCard';
import { NutritionCard } from './NutritionCard';
import { WorkoutLogger } from './WorkoutLogger';
import { SleepStages } from './SleepStages';

export function HealthView() {
  const { state } = useNexus();
  const burnToday = useMemo(() => estimateSessionBurn(state.workouts.filter((w) => w.date === todayISO()), state.profile.weightKg), [state.workouts, state.profile.weightKg]);
  const sets7 = state.workouts.length;

  return (
    <>
      <PageHeader
        eyebrow="Modules C · Health & athletic hub"
        title="Health & Performance"
        description="Dynamic TDEE, macro targets that move with training load, a Push / Pull / Legs logger and Epley 1RM estimates."
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Resting HR" value="58 bpm" sub="7-day baseline" icon={HeartPulse} tone="pink" />
        <Kpi label="Sleep score" value={`${state.sleepScore}/100`} sub="Deep + REM ≥ 40%" icon={Moon} tone="violet" />
        <Kpi label="Session burn" value={`${burnToday} kcal`} sub="Estimated from volume" icon={Flame} tone="amber" />
        <Kpi label="Logged sets" value={`${sets7}`} sub="All sessions" icon={Dumbbell} tone="lime" />
      </div>
      <div className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4"><ProfileCard burnToday={burnToday} /></div>
        <div className="flex flex-col gap-6 xl:col-span-4"><NutritionCard burnToday={burnToday} /></div>
        <div className="xl:col-span-4"><SleepStages /></div>
        <div className="xl:col-span-12"><WorkoutLogger /></div>
      </div>
    </>
  );
}
