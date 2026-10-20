'use client';

import {
  Activity,
  Banknote,
  HeartPulse,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';

import type { ModuleId } from '@/lib/types/nexus';

import { GlassCard } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';
import {
  computeReadiness,
  committedCapital,
  monthlyExpense,
  monthlyIncome,
} from '@/store/nexus-selectors';
import { groupProgress, countBottlenecks } from '@/components/mindmap/progress-rollup';
import { formatCurrency } from '@/lib/parser/utils';

import { BriefingBottlenecksColumn } from './BriefingBottlenecksColumn';
import { BriefingTelemetryColumn } from './BriefingTelemetryColumn';
import { BriefingTimelineColumn } from './BriefingTimelineColumn';

function KpiTile({
  label,
  value,
  sub,
  icon: Icon,
  tone,
  progress,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Activity;
  tone: string;
  progress?: number;
}) {
  return (
    <GlassCard className="p-4" hover>
      <div className="flex items-start justify-between">
        <p className="label-caps">{label}</p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-slate-100">{value}</p>
      <p className="mt-1 text-[10.5px] text-slate-500">{sub}</p>
      {progress !== undefined ? (
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-nexus-cyan to-nexus-violet"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      ) : null}
    </GlassCard>
  );
}

/** Module E — Cross-System Executive Briefing (4 KPIs + 3-column bento). */
export function ExecutiveBriefing() {
  const { state, dispatch } = useNexus();

  const kpis = useMemo(() => {
    const income = monthlyIncome(state.transactions);
    const expense = monthlyExpense(state.transactions);
    const net = income - expense;
    const readiness = computeReadiness(state.biometrics);
    const bottlenecks = countBottlenecks(state.tasks, new Date().toISOString().slice(0, 10));
    const workProgress = groupProgress(state.tasks, 'Work');
    const committed = committedCapital(state.tasks);
    const latest = state.biometrics[state.biometrics.length - 1];

    return { income, expense, net, readiness, bottlenecks, workProgress, committed, latest };
  }, [state.tasks, state.transactions, state.biometrics]);

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile
          label="Civil works progress"
          value={`${kpis.workProgress}%`}
          sub={`${state.tasks.filter((t) => t.groupCategory === 'Work').length} work packages tracked`}
          icon={Layers}
          tone="text-nexus-violet"
          progress={kpis.workProgress}
        />
        <KpiTile
          label="Net cashflow"
          value={formatCurrency(kpis.net, state.currency, { compact: true })}
          sub={`${formatCurrency(kpis.committed, state.currency, { compact: true })} committed capital`}
          icon={Banknote}
          tone="text-nexus-amber"
          progress={
            kpis.income > 0 ? Math.min(100, Math.max(0, (kpis.net / kpis.income) * 100)) : 0
          }
        />
        <KpiTile
          label="Readiness"
          value={`${kpis.readiness}/100`}
          sub={`Sleep ${kpis.latest?.sleepScore ?? 0} · ${kpis.latest?.restingHr ?? 0} bpm · ${(kpis.latest?.steps ?? 0).toLocaleString()} steps`}
          icon={HeartPulse}
          tone="text-nexus-emerald"
          progress={kpis.readiness}
        />
        <KpiTile
          label="Open bottlenecks"
          value={String(kpis.bottlenecks)}
          sub="Blocked or overdue across all boards"
          icon={TrendingUp}
          tone={kpis.bottlenecks > 4 ? 'text-nexus-rose' : 'text-nexus-cyan'}
          progress={Math.min(100, kpis.bottlenecks * 12)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <BriefingTimelineColumn />
        <BriefingBottlenecksColumn />
        <BriefingTelemetryColumn />
      </div>

      <GlassCard className="p-4" glow="none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-caps">Cross-system state</p>
            <h3 className="text-sm font-semibold tracking-tight text-slate-100">
              One command shell — five systems
            </h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'mindmap', label: 'Mind-Map', count: state.tasks.length },
              { id: 'finance', label: 'Finance', count: state.transactions.length },
              { id: 'health', label: 'Health', count: state.biometrics.length },
              { id: 'lab', label: 'Lab', count: state.labs.length },
            ].map((tile) => (
              <button
                key={tile.id}
                onClick={() => dispatch({ type: 'set-module', module: tile.id as ModuleId })}
                className="glass-soft px-3 py-2 text-left transition-colors hover:border-nexus-cyan/35"
              >
                <p className="text-[10px] text-slate-500">{tile.label}</p>
                <p className="font-mono text-sm font-semibold text-slate-100">{tile.count}</p>
              </button>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
