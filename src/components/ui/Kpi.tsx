import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Kpi({ label, value, sub, icon: Icon, tone = 'cyan' }: { label: string; value: string; sub?: string; icon: LucideIcon; tone?: 'cyan' | 'violet' | 'lime' | 'amber' | 'pink' }) {
  const tones: Record<string, string> = {
    cyan: 'text-cyan-300 bg-cyan-400/10',
    violet: 'text-violet-300 bg-violet-400/10',
    lime: 'text-lime-300 bg-lime-400/10',
    amber: 'text-amber-300 bg-amber-400/10',
    pink: 'text-pink-300 bg-pink-400/10',
  };
  return (
    <div className="glass group relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-white/20">
      <div className={cn('mb-4 grid h-10 w-10 place-items-center rounded-xl', tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
