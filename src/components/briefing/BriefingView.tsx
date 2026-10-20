'use client';

import { useMemo } from 'react';
import { Activity, Flame, Gauge, Moon, Wallet, Hammer } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { useCurrencyLabel } from '@/lib/currency';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { CurrencyToggle } from '@/components/ui/CurrencyToggle';
import { PageHeader } from '@/components/ui/PageHeader';
import { QuickCapture } from './QuickCapture';
import { Bottlenecks } from './Bottlenecks';
import { BurnArea, OutflowBars, SleepHrSpark } from './Sparks';
import { Timeline } from './Timeline';
import { macroTargets } from '@/lib/health';
import { todayISO } from '@/lib/utils';

export function BriefingView() {
  const { state, progress } = useNexus();
  const { label } = useCurrencyLabel();

  const kpis = useMemo(() => {
    const expenses30 = state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const burnPerDay = expenses30 / 30;
    const openLeaves = state.tasks.filter((t) => !progress.get(t.id)?.children.length && t.status !== 'done').length;
    const today = state.meals.filter((m) => m.date === todayISO());
    const kcal = today.reduce((s, m) => s + m.calories, 0);
    return { burnPerDay, openLeaves, civil: progress.get('civ-root')?.progress ?? 0, kcal, target: macroTargets(state.profile).kcal };
  }, [state, progress]);

  return (
    <>
      <PageHeader
        eyebrow="Executive briefing"
        title={`Good day, ${state.profile.name}`}
        description="Everything that needs you today: schedule, bottlenecks, cash-flow and recovery — in one view."
        actions={<CurrencyToggle />}
      />

      <QuickCapture />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Civil programme" value={`${kpis.civil}%`} sub="Bottom-up rollup" icon={Hammer} tone="cyan" />
        <Kpi label="Burn rate" value={`${label(kpis.burnPerDay)}/day`} sub="30-day average" icon={Wallet} tone="pink" />
        <Kpi label="Sleep score" value={`${state.sleepScore}/100`} sub="Last night" icon={Moon} tone="violet" />
        <Kpi label="Calories today" value={`${kpis.kcal} / ${kpis.target}`} sub={`${kpis.openLeaves} open leaf tasks`} icon={Flame} tone="lime" />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Today's timeline" subtitle="Scheduled engineering tasks & alarms" className="xl:col-span-4">
          <Timeline />
        </Card>

        <Card title="AI war-room" subtitle="Bottlenecks, live checklist and dispatch" className="xl:col-span-4">
          <Bottlenecks />
        </Card>

        <div className="flex flex-col gap-6 xl:col-span-4">
          <Card title="Recovery telemetry" subtitle="7-day sleep vs resting heart rate" right={<Activity className="h-4 w-4 text-violet-300" />}>
            <SleepHrSpark />
          </Card>
          <Card title="Outflow velocity" subtitle="Last 7 days — toggle USD / LKR above" right={<Gauge className="h-4 w-4 text-cyan-300" />}>
            <OutflowBars />
          </Card>
          <Card title="Burn trajectory" subtitle="Projected cumulative spend (14 days)">
            <BurnArea />
          </Card>
        </div>
      </div>
    </>
  );
}
