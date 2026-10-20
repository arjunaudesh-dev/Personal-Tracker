/**
 * Operator profile — drives BMR/TDEE calculations, briefing identity and
 * daily targets. Editable in the UI settings drawer.
 */
export interface OperatorProfile {
  name: string;
  role: string;
  unit: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct: number;
  activityFactor: number;
  baseCurrency: 'USD' | 'LKR';
  hydrationTargetMl: number;
  sleepTargetMin: number;
  stepTarget: number;
  proteinPerKg: number;
  dailyBurnRateUsd: number;
}

export const OPERATOR_PROFILE: OperatorProfile = {
  name: 'Officer Arjuna Kahandawa',
  role: 'Civil Engineer Officer',
  unit: 'Engineering Division',
  age: 34,
  heightCm: 178,
  weightKg: 82.4,
  bodyFatPct: 16.8,
  activityFactor: 1.55,
  baseCurrency: 'USD',
  hydrationTargetMl: 3_500,
  sleepTargetMin: 480,
  stepTarget: 10_000,
  proteinPerKg: 2.2,
  dailyBurnRateUsd: 115,
};
