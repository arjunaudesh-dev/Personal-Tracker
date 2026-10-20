import React, { useState } from 'react';
import { Bell, Calendar, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { MindMapTaskNode, TaskReminder } from '@/types/mindmap';
import { createGoogleCalendarUrl, syncAlarmToGoogleTasks } from '@/lib/google-workspace';

interface AlarmsSyncTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function AlarmsSyncTab({ task, onUpdate }: AlarmsSyncTabProps) {
  const reminders = task.reminders || [];
  const [time, setTime] = useState('09:00');
  const [label, setLabel] = useState('');

  const addReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    const newRem: TaskReminder = {
      id: `rem_${Date.now()}`,
      time,
      label: label.trim(),
      syncedGCal: true,
    };
    syncAlarmToGoogleTasks(newRem);
    onUpdate({ reminders: [...reminders, newRem] });
    setLabel('');
  };

  const removeReminder = (id: string) => {
    onUpdate({ reminders: reminders.filter((r) => r.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Scheduled Alarms & Google Sync ({reminders.length})
        </span>

        {reminders.map((r) => {
          const calUrl = createGoogleCalendarUrl(
            `${task.title}: ${r.label}`,
            `Task ID: ${task.id}\nCategory: ${task.groupCategory}`,
            task.dueDate || new Date().toISOString().split('T')[0],
            r.time
          );

          return (
            <div
              key={r.id}
              className="flex items-center justify-between p-2.5 bg-slate-800/70 rounded-lg border border-white/5 text-xs"
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-white">
                    <span className="text-violet-300 font-mono mr-2">{r.time}</span>
                    {r.label}
                  </div>
                  <span className="text-[10px] text-emerald-400">Google Calendar Synced</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-slate-400 hover:text-sky-400"
                  title="Open in Google Calendar"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => removeReminder(r.id)}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={addReminder} className="bg-slate-850 p-3 rounded-lg border border-white/5 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-violet-400" /> + Add Alarm / Sync Point
        </span>
        <div className="flex gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-28 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
          <input
            type="text"
            placeholder="Alarm reminder label e.g. Concrete slump test"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-1.5 rounded text-xs"
        >
          Schedule Alarm & Sync
        </button>
      </form>
    </div>
  );
}
