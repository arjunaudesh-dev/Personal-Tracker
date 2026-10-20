'use client';

import { AlertTriangle, Loader2, MessageCircle, Radio, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { BriefingDirective } from '@/lib/types/nexus';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';
import { cn, formatCurrency, waLink } from '@/lib/parser/utils';

const SEVERITY: Record<string, { tone: string; chip: string }> = {
  critical: { tone: 'border-nexus-rose/30 bg-nexus-rose/[0.07]', chip: 'border-nexus-rose/30 bg-nexus-rose/10 text-nexus-rose' },
  warning: { tone: 'border-nexus-amber/30 bg-nexus-amber/[0.06]', chip: 'border-nexus-amber/30 bg-nexus-amber/10 text-nexus-amber' },
  info: { tone: 'border-nexus-cyan/25 bg-nexus-cyan/[0.05]', chip: 'border-nexus-cyan/30 bg-nexus-cyan/10 text-nexus-cyan' },
};

const CONTACTS = [
  { id: 'c1', name: 'Nimal Perera', role: 'Site Supervisor', phone: '+94771234501' },
  { id: 'c2', name: 'Rukshan Silva', role: 'NHQ Liaison', phone: '+94772345602' },
  { id: 'c3', name: 'Chaminda Silva', role: 'Materials Supplier', phone: '+94773456703' },
];

/** Column 2 — AI war-room directives, live bottleneck checklist and dispatch row. */
export function BriefingBottlenecksColumn() {
  const { state, dispatch } = useNexus();
  const [directives, setDirectives] = useState<BriefingDirective[]>([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState<string[]>([]);

  const bottlenecks = useMemo(
    () =>
      state.tasks
        .filter((t) => t.status === 'blocked' || (t.dueDate && t.dueDate < new Date().toISOString().slice(0, 10) && t.status !== 'done'))
        .slice(0, 6),
    [state.tasks],
  );

  const runWarRoom = async () => {
    setLoading(true);
    try {
      const latest = state.biometrics[state.biometrics.length - 1];
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'war-room',
          payload: {
            urgent: state.tasks
              .filter((t) => t.status !== 'done')
              .slice(0, 12)
              .map((t) => ({
                id: t.id,
                title: t.title,
                status: t.status,
                dueDate: t.dueDate,
                group: t.groupCategory,
              })),
            sleepScore: latest?.sleepScore ?? 80,
            burnRate: state.transactions
              .filter((t) => t.type === 'expense')
              .slice(0, 30)
              .reduce((a, t) => a + t.amount, 0) / 30,
            committedSpend: state.tasks.reduce((a, t) => a + (t.cashflow?.committed ?? 0), 0),
            bottlenecks: bottlenecks.length,
          },
        }),
      });
      const json = await res.json();
      setDirectives(json.data?.directives ?? []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="flex h-full flex-col p-4" glow="rose">
      <SectionHeader
        eyebrow="Column 02"
        title="AI war-room & bottlenecks"
        action={
          <button onClick={runWarRoom} disabled={loading} className="btn btn-violet h-7 px-2.5 text-[10px]">
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            Synthesize
          </button>
        }
      />

      <div className="mt-3 space-y-2">
        {directives.map((d) => (
          <div key={d.id} className={`rounded-xl border p-2.5 ${SEVERITY[d.severity]?.tone ?? SEVERITY.info.tone}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 opacity-70" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold leading-snug text-slate-100">{d.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{d.detail}</p>
                <p className="mt-1 text-[9px] uppercase tracking-wider text-slate-600">{d.source}</p>
              </div>
            </div>
          </div>
        ))}
        {directives.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[10.5px] text-slate-600">
            Run the synthesizer to fuse urgent engineering tasks, burn rate and sleep score into
            three operational directives.
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex-1">
        <p className="label-caps mb-1.5">Live bottleneck checklist ({bottlenecks.length})</p>
        <ul className="scroll-thin max-h-[168px] space-y-1 overflow-y-auto pr-1">
          {bottlenecks.map((task) => {
            const isChecked = checked.includes(task.id);
            return (
              <li key={task.id}>
                <button
                  onClick={() => {
                    setChecked((prev) =>
                      prev.includes(task.id)
                        ? prev.filter((id) => id !== task.id)
                        : [...prev, task.id],
                    );
                    if (!isChecked) {
                      dispatch({
                        type: 'update-task',
                        id: task.id,
                        patch: { status: 'in-progress' },
                      });
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-left transition-colors hover:border-white/15"
                >
                  <span
                    className={cn(
                      'h-3 w-3 shrink-0 rounded border',
                      isChecked
                        ? 'border-nexus-emerald bg-nexus-emerald/30'
                        : task.status === 'blocked'
                          ? 'border-nexus-rose/60'
                          : 'border-white/20',
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-[10.5px] text-slate-300">
                    {task.title}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] text-slate-600">
                    {task.dueDate?.slice(5) ?? '—'}
                  </span>
                </button>
              </li>
            );
          })}
          {bottlenecks.length === 0 ? (
            <li className="rounded-lg border border-dashed border-white/10 px-2.5 py-3 text-center text-[10px] text-slate-600">
              No bottlenecks — the critical path is clear.
            </li>
          ) : null}
        </ul>
      </div>

      <div className="mt-3 border-t border-white/[0.07] pt-3">
        <p className="label-caps mb-1.5">WhatsApp dispatch</p>
        <div className="flex flex-wrap gap-1.5">
          {CONTACTS.map((contact) => (
            <a
              key={contact.id}
              href={waLink(
                contact.phone,
                `Morning brief ${new Date().toISOString().slice(0, 10)}: ${bottlenecks
                  .slice(0, 2)
                  .map((b) => b.title)
                  .join('; ')}`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn h-7 gap-1 px-2 text-[10px] text-nexus-emerald"
            >
              <MessageCircle className="h-3 w-3" />
              {contact.name.split(' ')[0]}
            </a>
          ))}
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[9.5px] text-slate-600">
          <Radio className="h-3 w-3" />
          Committed capital{' '}
          {formatCurrency(
            state.tasks.reduce((a, t) => a + (t.cashflow?.committed ?? 0), 0),
            state.currency,
            { compact: true },
          )}{' '}
          · pre-formatted wa.me deep links
        </p>
      </div>
    </GlassCard>
  );
}
