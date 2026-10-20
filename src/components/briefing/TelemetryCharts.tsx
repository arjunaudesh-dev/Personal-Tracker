import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { CurrencyCode } from '@/types/finance';

const telemetryHistory = [
  { day: 'Wed', sleepScore: 82, restingHr: 61, outflow: 95 },
  { day: 'Thu', sleepScore: 78, restingHr: 63, outflow: 140 },
  { day: 'Fri', sleepScore: 85, restingHr: 59, outflow: 210 },
  { day: 'Sat', sleepScore: 92, restingHr: 56, outflow: 80 },
  { day: 'Sun', sleepScore: 89, restingHr: 57, outflow: 60 },
  { day: 'Mon', sleepScore: 84, restingHr: 60, outflow: 320 },
  { day: 'Tue', sleepScore: 88, restingHr: 58, outflow: 115 },
];

export function TelemetryCharts() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  return (
    <div className="space-y-4">
      {/* 7-Day Sleep vs Resting HR */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Sleep Recovery vs Resting HR</span>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-indigo-400">● Sleep (Score)</span>
            <span className="text-rose-400">● HR (bpm)</span>
          </div>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={telemetryHistory}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[50, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="sleepScore" stroke="#818cf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="restingHr" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 7-Day Outflow Velocity Bar Chart */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Daily Outflow Velocity</span>
          <button
            type="button"
            onClick={() => setCurrency((c) => (c === 'USD' ? 'LKR' : 'USD'))}
            className="text-[10px] text-sky-400 font-mono hover:underline"
          >
            {currency} (308)
          </button>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={telemetryHistory}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(val: number) => formatCurrency(val, currency)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="outflow" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
