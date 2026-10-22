'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Network, Wallet, HeartPulse, FlaskConical, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNexus } from '@/lib/store';

const NAV = [
  { href: '/', label: 'Briefing', icon: LayoutDashboard, hint: 'Command centre' },
  { href: '/todo', label: 'To Do Space', icon: Network, hint: 'Orbit · universes & bridges' },
  { href: '/subscriptions', label: 'Monthly packages', icon: Wallet, hint: 'Subscriptions & mobile' },
  { href: '/mindmap', label: 'Mind-Map & BOQ', icon: Network, hint: 'Tasks & costs' },
  { href: '/finance', label: 'Finance', icon: Wallet, hint: '50 / 30 / 20' },
  { href: '/health', label: 'Health', icon: HeartPulse, hint: 'TDEE · Gym' },
  { href: '/bloodwork', label: 'Bloodwork', icon: FlaskConical, hint: 'Clinical lab' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const wide = pathname === '/todo' || pathname === '/mindmap';
  const { reset, hydrated } = useNexus();

  return (
    <div className={`mx-auto flex min-h-screen ${wide ? 'max-w-none' : 'max-w-[1500px]'} gap-6 p-4 md:p-6`}>
      <aside className="glass sticky top-4 hidden h-[calc(100vh-2rem)] w-64 shrink-0 flex-col p-4 md:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 shadow-glow">
            <Sparkles className="h-5 w-5 text-slate-950" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide">NEXUS LIFE-OS</p>
            <p className="text-[11px] text-slate-400">Personal &amp; civil command</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={cn('group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition', active ? 'text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5')}>
                {active && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-violet-500/20" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
                <Icon className="relative h-4.5 w-4.5 text-cyan-300" />
                <span className="relative flex flex-col">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-[11px] text-slate-500">{item.hint}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 px-2">
          <p className="text-[11px] leading-relaxed text-slate-500">
            Data stays on this device (localStorage). Clinical outputs are informational — confirm with your clinician.
          </p>
          <button
            type="button"
            onClick={() => { if (window.confirm('Reset all demo data to the seed state?')) reset(); }}
            className="btn-ghost w-full justify-center text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
          </button>
          <p className="text-center text-[10px] text-slate-600">{hydrated ? 'Synced locally' : 'Loading…'}</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <nav className="glass flex gap-1 overflow-x-auto p-1.5 md:hidden">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn('shrink-0 rounded-xl px-3 py-2 text-xs font-medium', active ? 'bg-gradient-to-r from-cyan-400/25 to-violet-500/25 text-white' : 'text-slate-400')}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <motion.main key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }} className="flex flex-col gap-6">
          {children}
        </motion.main>
      </div>
    </div>
  );
}
