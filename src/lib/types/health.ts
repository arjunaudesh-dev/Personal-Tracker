/**
 * NEXUS LIFE-OS — Biometric, wearable, training & clinical type contracts.
 */

export type SleepStage = 'deep' | 'light' | 'rem' | 'awake';
export type ActivityIntensity = 'rest' | 'light' | 'moderate' | 'vigorous';

export interface SleepSegment {
  stage: SleepStage;
  minutes: number;
}

export interface BiometricDay {
  date: string;
  steps: number;
  restingHr: number;
  activeHr: number;
  maxHr: number;
  caloriesBurned: number;
  sleepMinutes: number;
  sleepScore: number;
  hydrationMl: number;
  weightKg: number;
  bodyFatPct: number;
  sleepSegments: SleepSegment[];
  source: 'google-fit' | 'health-connect' | 'simulated';
}

export interface ExerciseSet {
  id: string;
  exercise: string;
  equipment: string;
  setNo: number;
  reps: number;
  weightKg: number;
  rpe: number;
  completed: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  split: string;
  title: string;
  durationMin: number;
  calories: number;
  sets: ExerciseSet[];
}

export interface MealEntry {
  id: string;
  date: string;
  slot: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  bmr: number;
  tdee: number;
  activityFactor: number;
  workoutAdjustment: number;
}

export interface Biomarker {
  key: string;
  label: string;
  value: number;
  unit: string;
  refLow: number;
  refHigh: number;
  category: 'lipid' | 'glycemic' | 'organ' | 'hormone' | 'vitamin';
  status: 'optimal' | 'normal' | 'borderline' | 'critical';
}

export interface LabReport {
  id: string;
  uploadedAt: string;
  fileName: string;
  source: 'gemini-vision' | 'manual' | 'local-heuristic';
  summary: string;
  biomarkers: Biomarker[];
  flags: string[];
}
