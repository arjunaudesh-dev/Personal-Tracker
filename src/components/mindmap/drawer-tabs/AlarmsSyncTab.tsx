'use client';

import { BellRing, CalendarDays, Clock, Plus, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

/** Tab 1c — alarms, reminders and Google Calendar synchronisation. */
export function AlarmsSyncTab({ task }: { task: MindMapTaskNode }) {
  const { dispatch } = useNexus();
  const [label, setLabel] = useState('');
  const [time, setTime] = useState('07:30');
  const [synced, setSynced] = useState(false);

  const addAlarm = () => {
    if (!label.trim()) return;
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: {
        reminders: [
          ...task.reminders,
          { id: uid('rem'), label: label.trim(), time, type: 'alarm' },
        ],
      },
    });
    setLabel('');
  };

  const removeAlarm = (id: string) => {
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: { reminders: task.reminders.filter((r) => r.id !== id) },
    });
  };

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 gap-2">
        <div className="glass-soft px-3 py-2">
          <p className="label-caps">Alarms</p>
          <p className="mt-1 font-mono text-sm font-semibold text-nexus-cyan">
            {task.reminders.length}
          </p>
        </div>
        <div className="glass-soft px-3 py-2">
          <p className="label-caps">Calendar sync</p>
          <p
            className={`mt-1 font-mono text-sm font-semibold ${
              synced ? 'text-nexus-emerald' : 'text-slate-500'
            }`}
          >
            {synced ? 'ACTIVE' : 'IDLE'}
          </p>
        </div>
      </section>

      <section>
        <p className="label-caps mb-2">Scheduled alarms</p>
        {task.reminders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
            No alarms on this task.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {task.reminders.map((reminder) => (
              <li
                key={reminder.id}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
              >
                <BellRing className="h-3.5 w-3.5 shrink-0 text-nexus-amber" />
                <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">
                  {reminder.label}
                </span>
                <span className="chip font-mono">{reminder.time}</span>
                <button
                  onClick={() => removeAlarm(reminder.id)}
                  className="btn btn-ghost h-6 w-6 p-0 text-slate-600 hover:text-nexus-rose"
                  aria-label="Remove alarm"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-soft p-3">
        <p className="label-caps mb-2">New alarm</p>
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Reminder label"
            className="input flex-1"
          />
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            type="time"
            className="input sm:w-32"
          />
          <button onClick={addAlarm} className="btn btn-primary">
            <Plus className="h-3 w-3" />
            Add
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-nexus-cyan" />
          <p className="text-[11px] font-semibold text-slate-200">Google Calendar bridge</p>
          <button
            onClick={() => setSynced((v) => !v)}
            className={`btn ml-auto h-7 px-2.5 text-[10px] ${
              synced ? 'btn-primary' : ''
            }`}
          >
            {synced ? 'Sync active' : 'Enable sync'}
          </button>
        </div>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
          {synced
            ? `Task "${task.title}" mirrors to the engineering calendar with a due date of ${task.dueDate ?? 'unscheduled'}.`
            : 'Enabling sync mirrors this task onto the engineering calendar and the Google Tasks list, and keeps alarms in step.'}
        </p>
        {synced ? (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-nexus-emerald">
            <Clock className="h-3 w-3" />
            Last sync just now · 1 event queued
          </div>
        ) : null}
      </section>
    </div>
  );
}
