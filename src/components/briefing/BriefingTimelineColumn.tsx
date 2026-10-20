import React, { useState } from 'react';
import { Clock, Bell, Calendar, Plus, CheckCircle2 } from 'lucide-react';
import { DailyScheduleSlot } from '@/types/nexus';
import { createGoogleCalendarUrl } from '@/lib/google-workspace';

const initialSchedule: DailyScheduleSlot[] = [
  { id: 's1', time: '06:00', title: 'Tactical Physical Readiness & Hydration (800ml)', type: 'physical', alarmActive: true, syncedGoogleCal: true },
  { id: 's2', time: '07:30', title: 'Civil Site Dispatch: Western Naval Command Harbor Dock', location: 'Naval Dockyard Gate 4', type: 'civil_review', alarmActive: true, syncedGoogleCal: true },
  { id: 's3', time: '09:00', title: 'Admin Building 1st Floor Slab Formwork & Rebar Inspection', location: 'Admin Complex Site', type: 'engineering', alarmActive: true, syncedGoogleCal: true },
  { id: 's4', time: '11:00', title: 'NHQ Concurrence Review Call with Cmdr. Silva', type: 'briefing', alarmActive: false, syncedGoogleCal: true },
  { id: 's5', time: '13:00', title: 'High-Protein Refuel & Vitamin D3 Clinical Dosing', type: 'physical', alarmActive: false, syncedGoogleCal: false },
  { id: 's6', time: '15:30', title: 'Sea Wall Geotextile & Rip-Rap Placement Quality Audit', location: 'Sector Charlie Shore', type: 'civil_review', alarmActive: true, syncedGoogleCal: true },
  { id: 's7', time: '18:00', title: 'Hypertrophy Power Session (Push Split & 1RM Bench)', location: 'Command Gym', type: 'physical', alarmActive: true, syncedGoogleCal: true },
  { id: 's8', time: '20:30', title: 'Evening Executive Debrief & BOQ Capital Reconciliation', type: 'briefing', alarmActive: false, syncedGoogleCal: false },
];

export function BriefingTimelineColumn() {
  const [schedule, setSchedule] = useState<DailyScheduleSlot[]>(initialSchedule);
  const [newTime, setNewTime] = useState('14:00');
  const [newTitle, setNewTitle] = useState('');

  const toggleAlarm = (id: string) => {
    setSchedule((prev) =>
      prev.map((s) => (s.id === id ? { ...s, alarmActive: !s.alarmActive } : s))
    );
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item: DailyScheduleSlot = {
      id: `slot_${Date.now()}`,
      time: newTime,
      title: newTitle.trim(),
      type: 'engineering',
      alarmActive: true,
      syncedGoogleCal: true,
    };
    setSchedule((prev) => [...prev, item].sort((a, b) => a.time.localeCompare(b.time)));
    setNewTitle('');
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Daily Timeline (06:00 - 22:00)
          </h3>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono">GCal Synced</span>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px] pr-1">
        {schedule.map((s) => {
          const calUrl = createGoogleCalendarUrl(s.title, s.location || '', '2026-10-20', s.time);
          return (
            <div
              key={s.id}
              className="p-2.5 rounded-lg bg-slate-950/50 border border-white/5 flex items-start gap-2.5 hover:border-sky-500/30 transition-all text-xs"
            >
              <span className="font-mono font-bold text-sky-400 text-xs mt-0.5 whitespace-nowrap">
                {s.time}
              </span>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{s.title}</div>
                {s.location && (
                  <div className="text-[10px] text-slate-400 mt-0.5">{s.location}</div>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => toggleAlarm(s.id)}
                  title="Toggle Alarm"
                  className={`p-1 rounded ${
                    s.alarmActive ? 'text-violet-400 bg-violet-500/10' : 'text-slate-600'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                </button>
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Google Calendar"
                  className="p-1 text-slate-500 hover:text-sky-400"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline quick slot addition */}
      <form onSubmit={handleAddSlot} className="flex gap-1.5 pt-2 border-t border-white/5">
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          className="w-20 bg-slate-800 text-slate-200 border border-white/10 rounded px-1.5 py-1 text-xs font-mono"
        />
        <input
          type="text"
          placeholder="+ Schedule action..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs focus:outline-none focus:border-sky-400"
        />
        <button
          type="submit"
          className="bg-sky-500 hover:bg-sky-400 text-white px-2.5 py-1 rounded text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
