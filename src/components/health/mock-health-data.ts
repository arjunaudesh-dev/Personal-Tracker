import type {
  BiometricDay,
  LabReport,
  MealEntry,
  SleepSegment,
  WorkoutSession,
} from '@/lib/types/health';

import { addDays, isoDate, seeded, uid } from '@/lib/parser/utils';

const BASE_WEIGHT = 82.4;

/**
 * 30 days of deterministic wearable telemetry (Xiaomi Mi Band / Mibro GT profile).
 * Values are generated from a seeded PRNG so every boot renders identical data.
 */
export function createMockBiometrics(days = 30): BiometricDay[] {
  const rand = seeded(20261020);
  const today = isoDate();
  const out: BiometricDay[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = addDays(today, -i);
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const isRest = dow === 0;
    const wave = Math.sin((days - i) / 2.7);

    const steps = Math.round(6_200 + wave * 2_400 + rand() * 4_800 + (isRest ? -2_600 : 1_900));
    const restingHr = Math.round(56 + wave * 3 + rand() * 5);
    const maxHr = Math.round(148 + wave * 12 + rand() * 22);
    const activeMin = Math.round(34 + wave * 18 + rand() * 40 + (isRest ? -22 : 16));
    const activeHr = Math.round(78 + wave * 6 + rand() * 14);
    const caloriesBurned = Math.round(
      1_620 + steps * 0.035 + activeMin * 6.4 + rand() * 180 - (isRest ? 220 : 0),
    );
    const sleepMinutes = Math.round(
      398 + wave * 26 + rand() * 62 - (dow === 6 ? 48 : 0),
    );
    const sleepScore = Math.min(
      99,
      Math.round(58 + (sleepMinutes / 480) * 38 + wave * 5 + rand() * 6),
    );
    const weightKg = Number((BASE_WEIGHT + wave * 0.55 + (days - i) * 0.012).toFixed(1));
    const bodyFatPct = Number((16.8 + wave * 0.4 + (days - i) * 0.006).toFixed(1));

    const deep = Math.round(sleepMinutes * (0.19 + rand() * 0.07));
    const rem = Math.round(sleepMinutes * (0.21 + rand() * 0.06));
    const awake = Math.round(sleepMinutes * (0.06 + rand() * 0.05));
    const light = Math.max(0, sleepMinutes - deep - rem - awake);

    const sleepSegments: SleepSegment[] = [
      { stage: 'deep', minutes: deep },
      { stage: 'light', minutes: light },
      { stage: 'rem', minutes: rem },
      { stage: 'awake', minutes: awake },
    ];

    out.push({
      date,
      steps: Math.max(1_800, steps),
      restingHr,
      activeHr,
      maxHr,
      caloriesBurned: Math.max(1_200, caloriesBurned),
      sleepMinutes,
      sleepScore,
      hydrationMl: Math.round(1_900 + wave * 420 + rand() * 900),
      weightKg,
      bodyFatPct,
      sleepSegments,
      source: 'simulated',
    });
  }

  return out;
}

export function createMockWorkouts(): WorkoutSession[] {
  const today = isoDate();
  const make = (
    offset: number,
    split: string,
    title: string,
    durationMin: number,
    calories: number,
    sets: Array<[string, string, number, number, number]>,
  ): WorkoutSession => ({
    id: `wo_${split.toLowerCase()}_${offset}`,
    date: addDays(today, -offset),
    split,
    title,
    durationMin,
    calories,
    sets: sets.map(([exercise, equipment, setNo, reps, weightKg], i) => ({
      id: uid('set'),
      exercise,
      equipment,
      setNo,
      reps,
      weightKg,
      rpe: 7 + ((i + setNo) % 4),
      completed: true,
    })),
  });

  return [
    make(1, 'Push', 'Push — Hypertrophy Block 4', 74, 620, [
      ['Barbell Bench Press', 'Barbell', 1, 8, 82.5],
      ['Barbell Bench Press', 'Barbell', 2, 8, 82.5],
      ['Barbell Bench Press', 'Barbell', 3, 6, 85],
      ['Incline Dumbbell Press', 'Dumbbell', 1, 10, 30],
      ['Incline Dumbbell Press', 'Dumbbell', 2, 10, 30],
      ['Seated Shoulder Press', 'Machine', 1, 12, 42],
      ['Cable Triceps Pressdown', 'Cable', 1, 14, 27.5],
    ]),
    make(3, 'Pull', 'Pull — Hypertrophy Block 4', 68, 580, [
      ['Weighted Pull-Up', 'Bodyweight', 1, 8, 15],
      ['Weighted Pull-Up', 'Bodyweight', 2, 6, 15],
      ['Barbell Row', 'Barbell', 1, 8, 72.5],
      ['Lat Pulldown', 'Cable', 1, 12, 58],
      ['Face Pull', 'Cable', 1, 15, 22],
    ]),
    make(5, 'Legs', 'Legs — Strength Block 4', 81, 740, [
      ['Back Squat', 'Barbell', 1, 5, 105],
      ['Back Squat', 'Barbell', 2, 5, 105],
      ['Romanian Deadlift', 'Barbell', 1, 10, 90],
      ['Leg Press', 'Machine', 1, 12, 180],
      ['Standing Calf Raise', 'Machine', 1, 15, 60],
    ]),
    make(8, 'Conditioning', 'Civil Work Conditioning — Site Circuit', 52, 480, [
      ['Loaded Carry', 'Trap Bar', 1, 40, 60],
      ['Step-Up', 'Box', 1, 12, 24],
      ['Grip Hang', 'Pull-up Bar', 1, 45, 0],
    ]),
  ];
}

export function createMockMeals(): MealEntry[] {
  const today = isoDate();
  const plan: Array<[number, MealEntry['slot'], string, number, number, number]> = [
    [0, 'breakfast', 'Egg white omelette + oats', 38, 52, 14],
    [0, 'lunch', 'Grilled chicken + jasmine rice + salad', 52, 78, 12],
    [0, 'dinner', 'Tuna seared salad', 42, 18, 16],
    [-1, 'breakfast', 'Oats, whey and banana', 34, 58, 10],
    [-1, 'lunch', 'Red rice, dhal and egg curry', 31, 72, 11],
    [-1, 'dinner', 'Grilled fish with roasted vegetables', 46, 26, 14],
    [-2, 'breakfast', 'Greek yoghurt, granola, berries', 30, 46, 11],
    [-2, 'lunch', 'Beef stir fry with vegetables', 48, 62, 15],
    [-2, 'dinner', 'Paneer curry with roti', 29, 52, 14],
  ];

  return plan.map(([offset, slot, name, protein, carbs, fat]) => ({
    id: uid('meal'),
    date: addDays(today, offset),
    slot,
    name,
    protein,
    carbs,
    fat,
    calories: Math.round(protein * 4 + carbs * 4 + fat * 9),
  }));
}

/** Reference laboratory panel — used as the seed for the AI lab analyzer preview. */
export const SAMPLE_LAB_REPORT: LabReport = {
  id: 'lab_sample_01',
  uploadedAt: new Date().toISOString(),
  fileName: 'reference-panel.pdf',
  source: 'local-heuristic',
  summary:
    'Reference panel showing sub-optimal vitamin D, elevated LDL and a TG/HDL ratio above the clinical threshold.',
  biomarkers: [
    { key: 'vitd', label: 'Vitamin D (25-OH)', value: 24.6, unit: 'ng/ml', refLow: 30, refHigh: 100, category: 'vitamin', status: 'critical' },
    { key: 'chol_total', label: 'Total Cholesterol', value: 212, unit: 'mg/dL', refLow: 125, refHigh: 200, category: 'lipid', status: 'borderline' },
    { key: 'hdl', label: 'HDL Cholesterol', value: 44, unit: 'mg/dL', refLow: 40, refHigh: 60, category: 'lipid', status: 'normal' },
    { key: 'ldl', label: 'LDL Cholesterol', value: 138, unit: 'mg/dL', refLow: 50, refHigh: 130, category: 'lipid', status: 'borderline' },
    { key: 'tg', label: 'Triglycerides', value: 176, unit: 'mg/dL', refLow: 50, refHigh: 150, category: 'lipid', status: 'borderline' },
    { key: 'tg_hdl', label: 'TG/HDL Ratio', value: 4.0, unit: 'ratio', refLow: 0, refHigh: 2.0, category: 'lipid', status: 'critical' },
    { key: 'fpg', label: 'Fasting Plasma Glucose', value: 96, unit: 'mg/dL', refLow: 70, refHigh: 99, category: 'glycemic', status: 'normal' },
    { key: 'hba1c', label: 'HbA1c', value: 5.6, unit: '%', refLow: 4.0, refHigh: 5.7, category: 'glycemic', status: 'normal' },
    { key: 'alt', label: 'ALT', value: 34, unit: 'U/L', refLow: 7, refHigh: 56, category: 'organ', status: 'normal' },
    { key: 'ast', label: 'AST', value: 27, unit: 'U/L', refLow: 10, refHigh: 40, category: 'organ', status: 'normal' },
    { key: 'creatinine', label: 'Creatinine', value: 0.94, unit: 'mg/dL', refLow: 0.6, refHigh: 1.2, category: 'organ', status: 'normal' },
    { key: 'egfr', label: 'eGFR', value: 96, unit: 'mL/min', refLow: 90, refHigh: 120, category: 'organ', status: 'normal' },
    { key: 'testosterone', label: 'Total Testosterone', value: 612, unit: 'ng/dL', refLow: 490, refHigh: 850, category: 'hormone', status: 'normal' },
    { key: 'b12', label: 'Vitamin B12', value: 388, unit: 'pg/mL', refLow: 300, refHigh: 900, category: 'vitamin', status: 'normal' },
  ],
  flags: [
    'Vitamin D (25-OH) below 30 ng/ml — start 12-week repletion protocol',
    'TG/HDL ratio 4.0 exceeds the 2.0 threshold — dietary fat quality intervention',
    'LDL 138 mg/dL above 130 mg/dL reference — re-test after 8 weeks',
  ],
};
