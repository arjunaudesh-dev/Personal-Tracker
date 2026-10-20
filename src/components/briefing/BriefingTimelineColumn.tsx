'use client';

import { AlarmClock, CalendarDays, Check, Clock, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { TimelineEntry } from '@/lib/types/nexus';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';
import { cn } from '@/lib/parser/utils';

const KIND_TONE: Record<string, string> = {
  meeting: 'text-nexus-violet',
  site: 'text-nexus-cyan',
  task: 'text-nexus-emerald',
  alarm: 'text-nexus-amber',
  training: 'text-nexus-rose',
};

const BASE_SCHEDULE: TimelineEntry[] = [
  { id: 'tl_1', time: '06:00', title: 'Morning telemetry sync — Mi Band / Mibro GT', kind: 'training', done: true },
  { id: 'tl_2', time: '06:30', title: 'Warm-up + mobility circuit', kind: 'training', done: true },
  { id: 'tl_3', time: '07:30', title: 'Tidal window simulation block (72 h model)', kind: 'site', done: false, taskId: 'dock.sim' },
  { id: 'tl_4', time: '09:00', title: 'Site progress meeting — NHQ liaison', kind: 'meeting', done: false, taskId: 'slab.nhq' },
  { id: 'tl_5', time: '11:30', title: 'TMT mill certificate chase — 16 mm', kind: 'site', done: false, taskId: 'slab.procure' },
  { id: 'tl_6', time: '13:00', title: 'Nutrition re-plan (training day macros)', kind: 'training', done: false },
  { id: 'tl_7', time: '15:00', title: 'Anchor grout delivery inspection', kind: 'site', done: false, taskId: 'dock.grout' },
  { id: 'tl_8', time: '17:30', title: 'BOQ reconciliation & ledger capture', kind: 'task', done: false },
  { id: 'tl_9', time: '19:30', title: 'Zone 2 conditioning — harbour track', kind: 'training', done: false },
  { id: 'tl_10', time: '21:30', title: 'Wind-down, magnesium glycinate 300 mg', kind: 'alarm', done: false },
];

/** Column 1 — vertical daily timeline with alarms and Google Calendar sync. */
export function BriefingTimelineColumn() {
  const { state, dispatch } = useNexus();
  const [synced, setSynced] = useState(true);
  const [done, setDone] = useState<string[]>(BASE_SCHEDULE.filter((e) => e.done).map((e) => e.id));
  const [newAlarm, setNewAlarm] = useState('');
  const [alarmTime, setAlarmTime] = useState('18:00');

  const entries = useMemo(() => {
    const taskAlarms = state.tasks
      .filter((t) => t.reminders.length > 0)
      .flatMap((t) =>
        t.reminders.map((r) => ({
          id: `alarm_${r.id}`,
          time: r.time,
          title: `${r.label} — ${t.title}`,
          kind: 'alarm' as const,
          done: false,
          taskId: t.id,
        })),
      );
    return [...BASE_SCHEDULE, ...taskAlarms].sort((a, b) => a.time.localeCompare(b.time));
  }, [state.tasks]);

  const addAlarm = () => {
    if (!newAlarm.trim()) return;
    const target = state.tasks.find((t) => t.status !== 'done');
    if (!target) return;
    dispatch({
      type: 'update-task',
      id: target.id,
      patch: {
        reminders: [
          ...target.reminders,
          {
            id: `rem_${Date.now().toString(36)}`,
            label: newAlarm.trim(),
            time: alarmTime,
            type: 'alarm',
          },
        ],
      },
    });
    setNewAlarm('');
  };

  return (
    <GlassCard className="flex h-full flex-col p-4" glow="cyan">
      <SectionHeader
        eyebrow="Column 01"
        title="Timeline, alarms & sync"
        action={
          <button
            onClick={() => setSynced((v) => !v)}
            className={cn('btn h-7 px-2.5 text-[10px]', synced && 'btn-primary')}
          >
            <CalendarDays className="h-3 w-3" />
            {synced ? 'GCal synced' : 'Sync off'}
          </button>
        }
      />

      <div className="scroll-thin relative mt-3 max-h-[420px] flex-1 overflow-y-auto pr-1">
        <span className="absolute left-[52px] top-2 bottom-2 w-px bg-gradient-to-b from-nexus-cyan/40 via-white/10 to-transparent" />
        <ul className="space-y-1.5">
          {entries.map((entry) => {
            const isDone = done.includes(entry.id);
            return (
              <li key={entry.id} className="relative flex items-start gap-2.5 pl-0">
                <span className="w-12 shrink-0 pt-1.5 text-right font-mono text-[10px] text-slate-500">
                  {entry.time}
                </span>
                <span className="relative z-10 mt-2 flex h-2 w-2 shrink-0 translate-x-[3px] items-center justify-center">
                  <span
                    className={cn(
                      'h-2 w-2 rounded-full',
                      isDone ? 'bg-nexus-emerald' : 'bg-ink-900 ring-1 ring-white/20',
                    )}
                  />
                </span>
                <button
                  onClick={() =>
                    setDone((prev) =>
                      prev.includes(entry.id)
                        ? prev.filter((id) => id !== entry.id)
                        : [...prev, entry.id],
                    )
                  }
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <Check
                    className={cn(
                      'h-3 w-3 shrink-0',
                      isDone ? 'text-nexus-emerald' : 'text-slate-700',
                    )}
                  />
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-[11px]',
                      isDone ? 'text-slate-600 line-through' : 'text-slate-300',
                    )}
                  >
                    {entry.title}
                  </span>
                  <span className={cn('shrink-0 text-[9px] uppercase tracking-wider', KIND_TONE[entry.kind])}>
                    {entry.kind}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-3 border-t border-white/[0.07] pt-3">
        <p className="label-caps mb-1.5">Inline alarm</p>
        <div className="flex gap-1.5">
          <input
            value={newAlarm}
            onChange={(e) => setNewAlarm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAlarm()}
            placeholder="Add alarm…"
            className="input"
          />
          <input
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            type="time"
            className="input w-24"
          />
          <button onClick={addAlarm} className="btn btn-primary px-2.5">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 flex items-center gap-1 text-[9.5px] text-slate-600">
          <AlarmClock className="h-3 w-3" />
          Alarms mirror to Google Calendar and the unit task list when sync is active.
        </p>
      </div>
    </GlassCard>
  );
}
