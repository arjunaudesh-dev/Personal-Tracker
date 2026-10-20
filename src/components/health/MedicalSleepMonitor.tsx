import React from 'react';
import { Moon, Sparkles, BedDouble } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { SleepStageBreakdown } from '@/types/health';

interface MedicalSleepMonitorProps {
  stages: SleepStageBreakdown;
}

export function MedicalSleepMonitor({ stages }: MedicalSleepMonitorProps) {
  const chartData = [
    { stage: 'Deep Sleep', minutes: stages.deepMinutes, color: '#38bdf8' },
    { stage: 'REM', minutes: stages.remMinutes, color: '#818cf8' },
    { stage: 'Light Sleep', minutes: stages.lightMinutes, color: '#34d399' },
    { stage: 'Awake', minutes: stages.awakeMinutes, color: '#f43f5e' },
  ];

  const totalHours = (stages.totalDurationMinutes / 60).toFixed(1);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Sleep Architecture (Xiaomi / Mibro Telemetry)
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Total: {totalHours} hrs</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">
            Efficiency: {stages.efficiencyPercent}%
          </span>
        </div>
      </div>

      <div className="h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis dataKey="stage" type="category" stroke="#94a3b8" fontSize={11} width={80} tickLine={false} />
            <Tooltip
              formatter={(val: number) => `${val} mins (${(val / 60).toFixed(1)} hrs)`}
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
            />
            <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/5 text-[11px] text-center">
        {chartData.map((d) => (
          <div key={d.stage} className="bg-slate-950/40 p-2 rounded-lg border border-white/5">
            <span className="text-slate-400 block text-[10px]">{d.stage}</span>
            <span className="font-bold font-mono text-white">{d.minutes} min</span>
          </div>
        ))}
      </div>
    </div>
  );
}
