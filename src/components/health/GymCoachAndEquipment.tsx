import React, { useState } from 'react';
import { Dumbbell, Plus, CheckCircle2, Flame, Award } from 'lucide-react';
import { WorkoutSession, SplitType, ExerciseSet } from '@/types/health';
import { calculateOneRepMax } from '@/lib/utils';

interface GymCoachAndEquipmentProps {
  session: WorkoutSession;
  onUpdateSession: (updated: WorkoutSession) => void;
}

export function GymCoachAndEquipment({
  session,
  onUpdateSession,
}: GymCoachAndEquipmentProps) {
  const [selectedSplit, setSelectedSplit] = useState<SplitType>(session.split);
  const splits: SplitType[] = ['Push', 'Pull', 'Legs', 'Civil Conditioning'];

  const handleAddSet = (exerciseId: string) => {
    const updatedExercises = session.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1] || { weightKg: 80, reps: 8, rpe: 7 };
      const newSet: ExerciseSet = {
        setNumber: ex.sets.length + 1,
        weightKg: lastSet.weightKg,
        reps: lastSet.reps,
        rpe: lastSet.rpe,
        estimated1RM: calculateOneRepMax(lastSet.weightKg, lastSet.reps),
        completed: false,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const handleUpdateSet = (
    exerciseId: string,
    setIndex: number,
    field: keyof ExerciseSet,
    val: any
  ) => {
    const updatedExercises = session.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const sets = [...ex.sets];
      const target = { ...sets[setIndex], [field]: val };
      if (field === 'weightKg' || field === 'reps') {
        target.estimated1RM = calculateOneRepMax(
          field === 'weightKg' ? Number(val) : target.weightKg,
          field === 'reps' ? Number(val) : target.reps
        );
      }
      sets[setIndex] = target;
      return { ...ex, sets };
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Hypertrophy & Gym Coach (Epley 1RM Engine)
          </h3>
        </div>

        {/* Split selector */}
        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-white/5">
          {splits.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSelectedSplit(s);
                onUpdateSession({ ...session, split: s });
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                selectedSplit === s
                  ? 'bg-sky-500 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {session.exercises.map((ex) => (
          <div key={ex.id} className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                <span className="text-[10px] text-slate-400">{ex.targetMuscle} • {ex.category}</span>
              </div>
              <button
                type="button"
                onClick={() => handleAddSet(ex.id)}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Set
              </button>
            </div>

            {/* Sets Table */}
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 text-[10px] font-mono uppercase">
                  <tr>
                    <th className="p-2 text-center w-12">Set</th>
                    <th className="p-2 text-center">Load (kg)</th>
                    <th className="p-2 text-center">Reps</th>
                    <th className="p-2 text-center">RPE (1-10)</th>
                    <th className="p-2 text-center">Est. 1RM</th>
                    <th className="p-2 text-center w-12">Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {ex.sets.map((set, sIdx) => (
                    <tr key={sIdx} className="hover:bg-white/5">
                      <td className="p-2 text-center font-mono font-bold text-slate-400">
                        {set.setNumber}
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={set.weightKg}
                          onChange={(e) => handleUpdateSet(ex.id, sIdx, 'weightKg', Number(e.target.value))}
                          className="w-16 bg-slate-800 text-white font-mono text-center rounded p-1 border border-white/10"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => handleUpdateSet(ex.id, sIdx, 'reps', Number(e.target.value))}
                          className="w-14 bg-slate-800 text-white font-mono text-center rounded p-1 border border-white/10"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="10"
                          value={set.rpe}
                          onChange={(e) => handleUpdateSet(ex.id, sIdx, 'rpe', Number(e.target.value))}
                          className="w-14 bg-slate-800 text-amber-300 font-mono text-center rounded p-1 border border-white/10"
                        />
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-sky-400">
                        {set.estimated1RM.toFixed(1)} kg
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={set.completed}
                          onChange={(e) => handleUpdateSet(ex.id, sIdx, 'completed', e.target.checked)}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
