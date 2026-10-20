'use client';

import { Activity, Brain, Droplet, FlaskConical, Plus, ShieldCheck } from 'lucide-react';

import type { Biomarker } from '@/lib/types/health';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';

const CATEGORY_META: Record<string, { label: string; icon: typeof Activity; tone: string }> = {
  lipid: { label: 'Lipid panel', icon: Droplet, tone: 'text-nexus-rose' },
  glycemic: { label: 'Glycemic control', icon: Activity, tone: 'text-nexus-amber' },
  organ: { label: 'Organ health', icon: ShieldCheck, tone: 'text-nexus-cyan' },
  hormone: { label: 'Hormones', icon: Brain, tone: 'text-nexus-violet' },
  vitamin: { label: 'Micronutrients', icon: FlaskConical, tone: 'text-nexus-emerald' },
};

/** Biomarker cards grouped by clinical category with corrective-task spawning. */
export function BiomarkerGrid({
  biomarkers,
  onSpawnTask,
}: {
  biomarkers: Biomarker[];
  onSpawnTask: (biomarker: Biomarker) => void;
}) {
  const grouped = biomarkers.reduce<Record<string, Biomarker[]>>((acc, b) => {
    acc[b.category] = [...(acc[b.category] ?? []), b];
    return acc;
  }, {});

  return (
    <>
      {Object.entries(grouped).map(([category, items]) => {
        const meta = CATEGORY_META[category] ?? CATEGORY_META.organ;
        const Icon = meta.icon;
        return (
          <GlassCard key={category} className="p-4" glow="none">
            <SectionHeader
              eyebrow="Biomarker group"
              title={
                <span className="flex items-center gap-2">
                  <Icon className={`h-3.5 w-3.5 ${meta.tone}`} />
                  {meta.label}
                </span>
              }
              action={
                <span className="chip">
                  {items.filter((b) => b.status !== 'normal').length} flagged
                </span>
              }
            />
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((b) => {
                const out = b.status !== 'normal';
                return (
                  <div
                    key={b.key}
                    className={`rounded-xl border p-3 transition-colors ${
                      b.status === 'critical'
                        ? 'border-nexus-rose/35 bg-nexus-rose/[0.07]'
                        : b.status === 'borderline'
                          ? 'border-nexus-amber/35 bg-nexus-amber/[0.06]'
                          : 'border-white/[0.07] bg-white/[0.02]'
                    }`}
                  >
                    <p className="truncate text-[11px] font-medium text-slate-200">{b.label}</p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="font-mono text-lg font-semibold text-slate-100">{b.value}</span>
                      <span className="text-[10px] text-slate-500">{b.unit}</span>
                      <span
                        className={`ml-auto chip ${
                          b.status === 'critical'
                            ? 'border-nexus-rose/30 bg-nexus-rose/10 text-nexus-rose'
                            : b.status === 'borderline'
                              ? 'border-nexus-amber/30 bg-nexus-amber/10 text-nexus-amber'
                              : 'border-nexus-emerald/25 bg-nexus-emerald/10 text-nexus-emerald'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-[9.5px] text-slate-600">
                      ref {b.refLow} – {b.refHigh} {b.unit}
                    </p>
                    {out ? (
                      <button
                        onClick={() => onSpawnTask(b)}
                        className="btn btn-primary mt-2 h-7 w-full gap-1 text-[10px]"
                      >
                        <Plus className="h-3 w-3" />
                        Add corrective task to Mind-Map
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        );
      })}
    </>
  );
}
