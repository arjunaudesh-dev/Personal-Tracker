import React from 'react';
import { Moon, Heart, Scale, Droplets, Footprints, Flame, RefreshCw } from 'lucide-react';
import { BiometricTelemetry } from '@/types/health';

interface BiometricReadinessHeaderProps {
  telemetry: BiometricTelemetry;
  onSync: () => void;
  syncing: boolean;
}

export function BiometricReadinessHeader({
  telemetry,
  onSync,
  syncing,
}: BiometricReadinessHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-400 font-mono uppercase tracking-wider">
            Biometric Readiness & Wearable Sync Hub
          </h2>
          <p className="text-xs text-slate-500">
            Source: {telemetry.deviceSource} • Last synced {telemetry.lastSynced}
          </p>
        </div>

        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Querying Google Fit...' : 'Sync Telemetry'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Sleep Score */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sleep Score</span>
            <Moon className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-400">
            {telemetry.sleepScore} <span className="text-xs text-slate-500">/ 100</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 font-semibold">Optimal Recovery</div>
        </div>

        {/* Resting Heart Rate */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Resting HR</span>
            <Heart className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold font-mono text-rose-400">
            {telemetry.restingHr} <span className="text-xs text-slate-500">bpm</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">HRV: {telemetry.hrvMs} ms</div>
        </div>

        {/* Body Weight */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Body Weight</span>
            <Scale className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-400">
            {telemetry.weightKg} <span className="text-xs text-slate-500">kg</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Lean Mass Stable</div>
        </div>

        {/* Hydration */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Hydration</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-400">
            {(telemetry.hydrationMl / 1000).toFixed(1)} <span className="text-xs text-slate-500">L</span>
          </div>
          <div className="text-[10px] text-cyan-300 mt-1">Target: 3.5 L</div>
        </div>

        {/* Daily Steps */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Site Footsteps</span>
            <Footprints className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {telemetry.steps.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Site Patrol Target Met</div>
        </div>

        {/* Active Calories */}
        <div className="bg-slate-900/80 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Burn</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {telemetry.activeCalories} <span className="text-xs text-slate-500">kcal</span>
          </div>
          <div className="text-[10px] text-amber-300 mt-1">Civil + Gym Combined</div>
        </div>
      </div>
    </div>
  );
}
