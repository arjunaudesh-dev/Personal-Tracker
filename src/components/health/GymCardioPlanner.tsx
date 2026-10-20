import React, { useState } from 'react';
import { Activity, Calculator, Zap } from 'lucide-react';
import { calculateOneRepMax } from '@/lib/utils';

export function GymCardioPlanner() {
  const [calcWeight, setCalcWeight] = useState(100);
  const [calcReps, setCalcReps] = useState(5);

  const estimated1RM = calculateOneRepMax(calcWeight, calcReps);

  const zones = [
    { zone: 'Zone 1 (Active Recovery)', bpm: '105 - 120 bpm', purpose: 'Lactate clearance, post-duty walk' },
    { zone: 'Zone 2 (Aerobic Engine)', bpm: '121 - 138 bpm', purpose: 'Mitochondrial density, site stamina' },
    { zone: 'Zone 3 (Tempo / Steady)', bpm: '139 - 152 bpm', purpose: 'Sustained civil patrol endurance' },
    { zone: 'Zone 4 (Threshold)', bpm: '153 - 168 bpm', purpose: 'Lactate threshold, sprint bursts' },
    { zone: 'Zone 5 (Max VO2)', bpm: '169 - 185 bpm', purpose: 'Tactical conditioning, peak exertion' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1RM Interactive Calculator */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Epley 1-Rep Max (1RM) Estimator
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-white/5">
          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              Test Load (kg)
            </label>
            <input
              type="number"
              value={calcWeight}
              onChange={(e) => setCalcWeight(Number(e.target.value))}
              className="w-full bg-slate-800 text-white font-mono font-bold rounded p-1.5 border border-white/10 text-sm"
            />
          </div>

          <div>
            <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
              Repetitions Completed
            </label>
            <input
              type="number"
              value={calcReps}
              onChange={(e) => setCalcReps(Number(e.target.value))}
              className="w-full bg-slate-800 text-white font-mono font-bold rounded p-1.5 border border-white/10 text-sm"
            />
          </div>
        </div>

        <div className="p-3 bg-sky-950/30 border border-sky-500/30 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] text-sky-400 font-mono uppercase">Calculated Max Potential</div>
            <div className="text-xl font-bold font-mono text-white">{estimated1RM} kg</div>
          </div>
          <div className="text-right text-[11px] text-slate-400 font-mono">
            <div>75% (Hypertrophy): {(estimated1RM * 0.75).toFixed(1)} kg</div>
            <div>85% (Strength): {(estimated1RM * 0.85).toFixed(1)} kg</div>
          </div>
        </div>
      </div>

      {/* Heart Rate Cardio Zones */}
      <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Cardiovascular Zones (Resting HR 58 bpm)
          </h3>
        </div>

        <div className="divide-y divide-white/5 bg-slate-950/60 rounded-xl border border-white/5">
          {zones.map((z, idx) => (
            <div key={idx} className="p-2 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-white">{z.zone}</span>
                <div className="text-[10px] text-slate-400">{z.purpose}</div>
              </div>
              <span className="font-mono text-rose-400 font-bold">{z.bpm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
