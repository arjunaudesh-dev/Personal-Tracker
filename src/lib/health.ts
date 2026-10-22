import type { Profile, WorkoutSet } from '@/types/nexus';

/** Mifflin–St Jeor basal metabolic rate (kcal/day). */
export function bmr(p: Pick<Profile, 'sex' | 'weightKg' | 'heightCm' | 'age'>): number {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  return Math.round(p.sex === 'male' ? base + 5 : base - 161);
}

/** Total daily energy expenditure = BMR x activity factor (PAL). */
export function tdee(p: Profile, extraBurnKcal = 0): number {
  return Math.round(bmr(p) * p.activity + extraBurnKcal);
}

/** Calorie target shifted by goal. */
export function calorieTarget(p: Profile, extraBurnKcal = 0): number {
  const shift = p.goal === 'cut' ? -500 : p.goal === 'bulk' ? 300 : 0;
  return tdee(p, extraBurnKcal) + shift;
}

/**
 * Macro split. Protein floor follows the spec (>= 180 g) raised by bodyweight
 * where relevant; fat fixed at 25% of kcal; carbs take the remainder.
 */
export function macroTargets(p: Profile, extraBurnKcal = 0) {
  const kcal = calorieTarget(p, extraBurnKcal);
  const protein = Math.max(180, Math.round(p.weightKg * 1.6));
  const fat = Math.round((kcal * 0.25) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { kcal, protein, carbs, fat };
}

/** Epley estimated one-rep max: w * (1 + reps / 30). */
export function oneRepMax(weightKg: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weightKg;
  return Math.round(weightKg * (1 + reps / 30) * 10) / 10;
}

export function bestOneRepMaxByExercise(sets: WorkoutSet[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of sets) {
    const e1rm = oneRepMax(s.weightKg, s.reps);
    if (e1rm > (out[s.exercise] ?? 0)) out[s.exercise] = e1rm;
  }
  return out;
}

/** Rough active-calorie estimate for a session (MET-based, 60-min equivalent scaled by volume). */
export function estimateSessionBurn(sets: WorkoutSet[], bodyKg: number): number {
  const volume = sets.reduce((s, w) => s + w.sets * w.reps, 0);
  const minutes = Math.min(90, volume * 0.1 + 15);
  return Math.round(5 * bodyKg * (minutes / 60));
}
