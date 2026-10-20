import {
  BiometricTelemetry,
  SleepStageBreakdown,
  MacroNutritionPlan,
  WorkoutSession,
  ClinicalBloodworkReport,
  MealEntry,
} from '@/types/health';

export const initialTelemetry: BiometricTelemetry = {
  date: '2026-10-20',
  sleepScore: 88,
  restingHr: 58,
  hrvMs: 64,
  weightKg: 78.4,
  hydrationMl: 2800,
  steps: 12450,
  activeCalories: 740,
  deviceSource: 'Mibro Watch GS Pro / Mi Band 8',
  lastSynced: '10 mins ago',
};

export const initialSleepStages: SleepStageBreakdown = {
  date: '2026-10-20',
  deepMinutes: 112,
  lightMinutes: 248,
  remMinutes: 98,
  awakeMinutes: 22,
  totalDurationMinutes: 480,
  efficiencyPercent: 91,
};

export const initialNutritionPlan: MacroNutritionPlan = {
  bmr: 1780,
  tdee: 2840,
  calorieTarget: 2900,
  proteinG: 195, // Officer target >= 180g
  carbsG: 340,
  fatsG: 75,
  currentCalories: 2150,
  currentProtein: 165,
  currentCarbs: 240,
  currentFats: 58,
  waterTargetMl: 3500,
  currentWaterMl: 2800,
};

export const initialMealLogs: MealEntry[] = [
  { id: 'm1', time: '07:30', name: '4 Whole Eggs, 3 Slices Sourdough, Black Coffee', calories: 620, protein: 36, carbs: 54, fats: 26 },
  { id: 'm2', time: '12:30', name: 'Grilled Chicken Breast 220g with Basmati Rice & Steamed Veg', calories: 780, protein: 68, carbs: 82, fats: 14 },
  { id: 'm3', time: '16:30', name: 'Whey Isolate Shake + 1 Banana + 30g Almonds', calories: 420, protein: 38, carbs: 32, fats: 16 },
];

export const initialWorkoutSession: WorkoutSession = {
  id: 'w-push-01',
  date: '2026-10-20',
  split: 'Push',
  title: 'Heavy Barbell Press & Civil Functional Power',
  durationMinutes: 65,
  completed: true,
  exercises: [
    {
      id: 'ex-1',
      name: 'Barbell Flat Bench Press',
      category: 'Compound',
      targetMuscle: 'Pectorals / Triceps',
      sets: [
        { setNumber: 1, weightKg: 80, reps: 10, rpe: 7, estimated1RM: 106.7, completed: true },
        { setNumber: 2, weightKg: 95, reps: 6, rpe: 8, estimated1RM: 114.0, completed: true },
        { setNumber: 3, weightKg: 105, reps: 4, rpe: 9, estimated1RM: 119.0, completed: true },
      ],
    },
    {
      id: 'ex-2',
      name: 'Standing Military Overhead Press',
      category: 'Compound',
      targetMuscle: 'Anterior Deltoids',
      sets: [
        { setNumber: 1, weightKg: 50, reps: 8, rpe: 7.5, estimated1RM: 63.3, completed: true },
        { setNumber: 2, weightKg: 60, reps: 5, rpe: 8.5, estimated1RM: 70.0, completed: true },
      ],
    },
  ],
};

export const initialBloodwork: ClinicalBloodworkReport = {
  id: 'rep-asiri-01',
  date: '2026-10-18',
  labName: 'Asiri Surgical Central Pathology Laboratories',
  aiClinicalInterpretation: 'Optimal cardiovascular endurance and endocrine profiles. Low Vitamin D3 (25-OH) requires therapeutic intervention to avoid reduction in muscle protein synthesis and bone density during site works.',
  keyDirectives: [
    'Commence 5,000 IU Vitamin D3 daily with fatty meal.',
    'Increase omega-3 fish oil (2g/day) to support LDL profile.',
    'Excellent renal eGFR (98) validates current high-protein athletics.',
  ],
  biomarkers: [
    { id: 'b1', name: 'Total Cholesterol', category: 'Lipid', value: 182, unit: 'mg/dL', referenceRange: '< 200', status: 'optimal' },
    { id: 'b2', name: 'HDL Cholesterol', category: 'Lipid', value: 54, unit: 'mg/dL', referenceRange: '> 40', status: 'optimal' },
    { id: 'b3', name: 'LDL Cholesterol', category: 'Lipid', value: 108, unit: 'mg/dL', referenceRange: '< 100', status: 'borderline', correctiveAction: 'Add 15g soluble fiber & omega-3' },
    { id: 'b4', name: 'Triglycerides', category: 'Lipid', value: 100, unit: 'mg/dL', referenceRange: '< 150', status: 'optimal' },
    { id: 'b5', name: 'TG / HDL Ratio', category: 'Lipid', value: 1.85, unit: 'ratio', referenceRange: '< 2.0', status: 'optimal' },
    { id: 'b6', name: 'Fasting Plasma Glucose', category: 'Glycemic', value: 89, unit: 'mg/dL', referenceRange: '70 - 99', status: 'optimal' },
    { id: 'b7', name: 'HbA1c', category: 'Glycemic', value: 5.3, unit: '%', referenceRange: '< 5.7', status: 'optimal' },
    { id: 'b8', name: 'ALT (SGPT)', category: 'Organ', value: 28, unit: 'U/L', referenceRange: '< 45', status: 'optimal' },
    { id: 'b9', name: 'AST (SGOT)', category: 'Organ', value: 24, unit: 'U/L', referenceRange: '< 35', status: 'optimal' },
    { id: 'b10', name: 'Creatinine', category: 'Organ', value: 1.05, unit: 'mg/dL', referenceRange: '0.7 - 1.2', status: 'optimal' },
    { id: 'b11', name: 'eGFR', category: 'Organ', value: 98, unit: 'mL/min/1.73m²', referenceRange: '> 90', status: 'optimal' },
    { id: 'b12', name: 'Vitamin D3 (25-OH)', category: 'Micronutrient', value: 24.2, unit: 'ng/mL', referenceRange: '30 - 100', status: 'critical', correctiveAction: '5,000 IU Vitamin D3 daily' },
    { id: 'b13', name: 'Vitamin B12', category: 'Micronutrient', value: 580, unit: 'pg/mL', referenceRange: '200 - 900', status: 'optimal' },
    { id: 'b14', name: 'Total Testosterone', category: 'Hormone', value: 685, unit: 'ng/dL', referenceRange: '300 - 1000', status: 'optimal' },
  ],
};
