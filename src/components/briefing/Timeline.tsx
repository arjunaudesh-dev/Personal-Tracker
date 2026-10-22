'use client';

import { useState } from 'react';
import { Bell, BellOff, CalendarCheck2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Slot { time: string; title: string; group: 'Civil' | 'Health' | 'Finance' | 'Personal'; alarm: boolean }

const SLOTS: Slot[] = [
  { time: '06:00', title: 'Morning mobility + hydration', group: 'Health', alarm: true },
  { time: '07:30', title: 'Site walk — dock mooring check', group: 'Civil', alarm: true },
  { time: '10:00', title: 'NHQ concurrence letter draft', group: 'Civil', alarm: false },
  { time: '13:00', title: 'Log lunch + protein check', group: 'Health', alarm: false },
  { time: '17:30', title: 'Push session (bench, OHP)', group: 'Health', alarm: true },
  { time: '20:00', title: 'Weekly budget review (50/30/20)', group: 'Finance', alarm: true },
  { time: '22:00', title: 'Wind-down — screens off', group: 'Personal', alarm: false },
];

const GROUP_TONE: Record<Slot['group'], string> = {
  Civil: 'bg-cyan-400', Health: 'bg-lime-400', Finance: 'bg-amber-400', Personal: 'bg-violet-400',
};

export function Timeline() {
  const [alarms, setAlarms] = useState(() => SLOTS.map((s) => s.alarm));
  const [gcal, setGcal] = useState(false);

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs">
        <span className="flex items-center gap-2 text-slate-300"><CalendarCheck2 className="h-4 w-4 text-cyan-300" /> Google Calendar sync</span>
        <input type="checkbox" className="accent-cyan-400" checked={gcal} onChange={(e) => setGcal(e.target.checked)} />
      </label>
      <ol className="relative space-y-4 border-l border-white/10 pl-5">
        {SLOTS.map((s, i) => (
          <li key={s.time} className="relative">
            <span className={cn('absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-slate-950', GROUP_TONE[s.group])} />
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-[11px] text-slate-500">{s.time}</p>
                <p className="text-sm">{s.title}</p>
                <p className="text-[11px] text-slate-500">{s.group}{gcal ? ' · synced' : ''}</p>
              </div>
              <button aria-label={alarms[i] ? 'Disable alarm' : 'Enable alarm'} onClick={() => setAlarms((a) => a.map((v, j) => (j === i ? !v : v)))} className={cn('rounded-lg p-1.5 transition', alarms[i] ? 'text-amber-300 hover:bg-amber-400/10' : 'text-slate-600 hover:bg-white/5')}>
                {alarms[i] ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
