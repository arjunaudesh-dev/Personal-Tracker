import { NextResponse } from 'next/server';

import {
  computeMacroTargets,
  computeReadiness,
} from '@/store/nexus-selectors';
import { createMockBiometrics, createMockWorkouts } from '@/components/health/mock-health-data';
import { OPERATOR_PROFILE } from '@/lib/config/profile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Aggregate health summary consumed by the wearable bridge and mobile client. */
export async function GET() {
  const biometrics = createMockBiometrics();
  const workouts = createMockWorkouts();
  const latest = biometrics[biometrics.length - 1];
  const macros = computeMacroTargets(biometrics, workouts);
  const readiness = computeReadiness(biometrics);

  return NextResponse.json({
    data: {
      readiness,
      sleepScore: latest?.sleepScore ?? 0,
      restingHr: latest?.restingHr ?? 0,
      steps: latest?.steps ?? 0,
      caloriesBurned: latest?.caloriesBurned ?? 0,
      hydrationMl: latest?.hydrationMl ?? 0,
      weightKg: latest?.weightKg ?? OPERATOR_PROFILE.weightKg,
      macros,
      operator: {
        name: OPERATOR_PROFILE.name,
        role: OPERATOR_PROFILE.role,
        unit: OPERATOR_PROFILE.unit,
      },
    },
  });
}
