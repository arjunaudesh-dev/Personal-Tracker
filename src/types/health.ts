export type SplitType = 'Push' | 'Pull' | 'Legs' | 'Civil Conditioning';
export type BiomarkerStatus = 'optimal' | 'borderline' | 'critical';
export type BiomarkerCategory = 'Lipid' | 'Glycemic' | 'Organ' | 'Micronutrient' | 'Hormone';

export interface BiometricTelemetry {
  date: string;
  sleepScore: number;
  restingHr: number;
  hrvMs: number;
  weightKg: number;
  hydrationMl: number;
  steps: number;
  activeCalories: number;
  deviceSource: string;
  lastSynced: string;
}

export interface SleepStageBreakdown {
  date: string;
  deepMinutes: number;
  lightMinutes: number;
  remMinutes: number;
  awakeMinutes: number;
  totalDurationMinutes: number;
  efficiencyPercent: number;
}

export interface MacroNutritionPlan {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  proteinG: number; // Target >= 180g
  carbsG: number;
  fatsG: number;
  currentCalories: number;
  currentProtein: number;
  currentCarbs: number;
  currentFats: number;
  waterTargetMl: number;
  currentWaterMl: number;
}

export interface MealEntry {
  id: string;
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  aiLogged?: boolean;
}

export interface ExerciseSet {
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number; // 1-10
  estimated1RM: number; // Weight * (1 + Reps/30)
  completed: boolean;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: string;
  targetMuscle: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  split: SplitType;
  title: string;
  durationMinutes: number;
  completed: boolean;
  exercises: ExerciseItem[];
}

export interface Biomarker {
  id: string;
  name: string;
  category: BiomarkerCategory;
  value: number;
  unit: string;
  referenceRange: string;
  status: BiomarkerStatus;
  correctiveAction?: string;
  spawnedTaskId?: string;
}

export interface ClinicalBloodworkReport {
  id: string;
  date: string;
  labName: string;
  biomarkers: Biomarker[];
  aiClinicalInterpretation: string;
  keyDirectives: string[];
}
