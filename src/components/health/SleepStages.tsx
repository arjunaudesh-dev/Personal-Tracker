'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '@/components/ui/Card';
import { useNexus } from '@/lib/store';

const STAGES = [
  { name: 'Deep', minutes: 88, color: '#7c3aed' },
  { name: 'REM', minutes: 102, color: '#22d3ee' },
  { name: 'Light', minutes: 238, color: '#60a5fa' },
  { name: 'Awake', minutes: 14, color: '#f472b6' },
];

export function SleepStages() {
  const { state } = useNexus();
  const total = STAGES.reduce((s, x) => s + x.minutes, 0);
  return (
    <Card title="Sleep architecture" subtitle={`Last night · score ${state.sleepScore}/100 · ${(total / 60).toFixed(1)} h in bed`}>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={STAGES} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" m" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#cbd5e1' }} axisLine={false} tickLine={false} width={50} />
            <Tooltip contentStyle={{ background: '#0a0d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v} min`]} />
            <Bar dataKey="minutes" radius={[0, 8, 8, 0]}>
              {STAGES.map((s) => <Cell key={s.name} fill={s.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">Sample wearable data. Deep + REM above 40% of total is a good recovery signal.</p>
    </Card>
  );
}
