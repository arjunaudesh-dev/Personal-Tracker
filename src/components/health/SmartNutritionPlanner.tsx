import React, { useState } from 'react';
import { Utensils, Sparkles, Plus, CheckCircle2, Droplet } from 'lucide-react';
import { MacroNutritionPlan, MealEntry } from '@/types/health';
import { nexusAi } from '@/lib/ai-service';

interface SmartNutritionPlannerProps {
  plan: MacroNutritionPlan;
  meals: MealEntry[];
  onAddMeal: (meal: MealEntry) => void;
  onAddWater: (amountMl: number) => void;
}

export function SmartNutritionPlanner({
  plan,
  meals,
  onAddMeal,
  onAddWater,
}: SmartNutritionPlannerProps) {
  const [mealText, setMealText] = useState('');
  const [parsing, setParsing] = useState(false);

  const handleAiMealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText.trim()) return;
    setParsing(true);
    try {
      const parsed = await nexusAi.parseMealNutrition(mealText);
      onAddMeal({
        id: `m_${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...parsed,
      });
      setMealText('');
    } finally {
      setParsing(false);
    }
  };

  const proteinMet = plan.currentProtein >= 180;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Dynamic TDEE & Macro Nutrition Command
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">TDEE: {plan.tdee} kcal</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">
            Target: {plan.calorieTarget} kcal
          </span>
        </div>
      </div>

      {/* Macro Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Calories */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Calories</span>
            <span className="font-mono text-white font-bold">
              {plan.currentCalories} / {plan.calorieTarget}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full transition-all"
              style={{ width: `${Math.min(100, (plan.currentCalories / plan.calorieTarget) * 100)}%` }}
            />
          </div>
        </div>

        {/* Protein (Target >= 180g) */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Protein (≥180g)</span>
            <span className={`font-mono font-bold ${proteinMet ? 'text-emerald-400' : 'text-sky-400'}`}>
              {plan.currentProtein} / {plan.proteinG}g
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${proteinMet ? 'bg-emerald-400' : 'bg-sky-400'}`}
              style={{ width: `${Math.min(100, (plan.currentProtein / plan.proteinG) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Carbohydrates</span>
            <span className="font-mono text-white font-bold">
              {plan.currentCarbs} / {plan.carbsG}g
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all"
              style={{ width: `${Math.min(100, (plan.currentCarbs / plan.carbsG) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fats */}
        <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Fats</span>
            <span className="font-mono text-white font-bold">
              {plan.currentFats} / {plan.fatsG}g
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-400 h-full transition-all"
              style={{ width: `${Math.min(100, (plan.currentFats / plan.fatsG) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Quick Meal Input */}
      <form onSubmit={handleAiMealSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="AI Meal Logger: '200g grilled salmon with sweet potato and broccoli'..."
            value={mealText}
            onChange={(e) => setMealText(e.target.value)}
            className="w-full bg-slate-800 text-white pl-3 pr-8 py-2 rounded-lg border border-white/10 text-xs focus:ring-1 focus:ring-emerald-400 focus:outline-none"
          />
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-2.5" />
        </div>
        <button
          type="submit"
          disabled={parsing || !mealText.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 shadow-glow-emerald"
        >
          {parsing ? 'Estimating...' : 'Log Meal'}
        </button>
      </form>

      {/* Recent Meal Logs */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 uppercase">Today&apos;s Fuel Log:</span>
        <div className="divide-y divide-white/5 bg-slate-950/40 rounded-lg border border-white/5">
          {meals.map((m) => (
            <div key={m.id} className="p-2.5 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 font-mono mr-2">{m.time}</span>
                <span className="font-semibold text-white">{m.name}</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-slate-300">
                <span className="text-amber-400">{m.calories} kcal</span>
                <span className="text-sky-400">{m.protein}g P</span>
                <span className="text-cyan-400">{m.carbs}g C</span>
                <span className="text-purple-400">{m.fats}g F</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
