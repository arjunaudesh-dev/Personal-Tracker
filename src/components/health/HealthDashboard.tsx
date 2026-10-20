'use client';

import { useMemo } from 'react';

import { useNexus } from '@/store/nexus-store';
import { computeReadiness } from '@/store/nexus-selectors';

import { BiometricReadinessHeader } from './BiometricReadinessHeader';
import { GymCardioPlanner } from './GymCardioPlanner';
import { GymCoachAndEquipment, OneRepMaxCalculator } from './GymCoachAndEquipment';
import { MedicalSleepMonitor } from './MedicalSleepMonitor';
import { SmartNutritionPlanner } from './SmartNutritionPlanner';

/** Module C — Health, Athletic & Wearable Sync Hub. */
export function HealthDashboard() {
  const { state } = useNexus();
  const readiness = useMemo(
    () => computeReadiness(state.biometrics),
    [state.biometrics],
  );

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <BiometricReadinessHeader biometrics={state.biometrics} readiness={readiness} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <MedicalSleepMonitor biometrics={state.biometrics} />
        </div>
        <SmartNutritionPlanner
          biometrics={state.biometrics}
          workouts={state.workouts}
          meals={state.meals}
        />
      </div>

      <GymCardioPlanner biometrics={state.biometrics} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <GymCoachAndEquipment workouts={state.workouts} />
        </div>
        <OneRepMaxCalculator />
      </div>
    </div>
  );
}
