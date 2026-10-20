import React from 'react';
import { ShieldCheck, AlertCircle, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { BriefingTimelineColumn } from './BriefingTimelineColumn';
import { BriefingBottlenecksColumn } from './BriefingBottlenecksColumn';
import { BriefingTelemetryColumn } from './BriefingTelemetryColumn';
import { SystemModule } from '@/types/nexus';

interface ExecutiveBriefingProps {
  onNavigateModule: (module: SystemModule) => void;
}

export function ExecutiveBriefing({ onNavigateModule }: ExecutiveBriefingProps) {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Executive Command Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-lg font-bold text-white tracking-wide">
              NEXUS LIFE-OS // MORNING COMMAND BRIEFING
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Officer Arjuna Kahandawa • Western Naval Command Civil Engineering • Tuesday 20 Oct 2026
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-900 text-sky-400 border border-sky-500/20">
            SEC-DEF // LEVEL 1
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-900 text-emerald-400 border border-emerald-500/20">
            SYSTEMS: GREEN
          </span>
        </div>
      </div>

      {/* Top 4 Holistic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Readiness */}
        <button
          type="button"
          onClick={() => onNavigateModule('mindmap')}
          className="text-left bg-slate-900/80 hover:bg-slate-800/80 p-4 rounded-xl border border-white/10 shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Overall Readiness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">94%</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Naval Civil Operations</span>
            <span className="text-sky-400">Open Mind-Map →</span>
          </div>
        </button>

        {/* Active Bottlenecks */}
        <button
          type="button"
          onClick={() => onNavigateModule('mindmap')}
          className="text-left bg-slate-900/80 hover:bg-slate-800/80 p-4 rounded-xl border border-white/10 shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Civil Bottlenecks</span>
            <AlertCircle className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">3 Critical</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Admin Slab, Harbor, Sea Wall</span>
            <span className="text-sky-400">Inspect Tree →</span>
          </div>
        </button>

        {/* Net Liquid Reserve */}
        <button
          type="button"
          onClick={() => onNavigateModule('finance')}
          className="text-left bg-slate-900/80 hover:bg-slate-800/80 p-4 rounded-xl border border-white/10 shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Net Liquid Reserve</span>
            <DollarSign className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">$14,850</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Rs. 4,573,800 LKR @ 308</span>
            <span className="text-sky-400">View Waterfall →</span>
          </div>
        </button>

        {/* Sleep & Biometric Recovery */}
        <button
          type="button"
          onClick={() => onNavigateModule('health')}
          className="text-left bg-slate-900/80 hover:bg-slate-800/80 p-4 rounded-xl border border-white/10 shadow-lg group transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sleep & Athletic Recovery</span>
            <Activity className="w-4 h-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">88 / 100</div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Resting HR 58 bpm (Mibro GS)</span>
            <span className="text-sky-400">Health Hub →</span>
          </div>
        </button>
      </div>

      {/* 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Column 1: Daily Timeline */}
        <div className="lg:col-span-1">
          <BriefingTimelineColumn />
        </div>

        {/* Column 2: AI War-Room Strategy & Bottleneck Checklist */}
        <div className="lg:col-span-1">
          <BriefingBottlenecksColumn />
        </div>

        {/* Column 3: Telemetry Sparklines & Quick Loggers */}
        <div className="lg:col-span-1">
          <BriefingTelemetryColumn />
        </div>
      </div>
    </div>
  );
}
