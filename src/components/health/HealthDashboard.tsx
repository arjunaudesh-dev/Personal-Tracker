import React, { useState } from 'react';
import {
  initialTelemetry,
  initialSleepStages,
  initialNutritionPlan,
  initialMealLogs,
  initialWorkoutSession,
} from './mock-health-data';
import { BiometricReadinessHeader } from './BiometricReadinessHeader';
import { SmartNutritionPlanner } from './SmartNutritionPlanner';
import { GymCoachAndEquipment } from './GymCoachAndEquipment';
import { GymCardioPlanner } from './GymCardioPlanner';
import { MedicalSleepMonitor } from './MedicalSleepMonitor';
import { MedicalReportAnalyzer } from './MedicalReportAnalyzer';
import { fetchGoogleFitTelemetry } from '@/lib/integrations/wearable-sync';
import { MealEntry, WorkoutSession } from '@/types/health';

interface HealthDashboardProps {
  onSpawnTask?: (task: { title: string; category: string; priority: string; notes: string }) => void;
}

export function HealthDashboard({ onSpawnTask }: HealthDashboardProps) {
  const [telemetry, setTelemetry] = useState(initialTelemetry);
  const [stages, setStages] = useState(initialSleepStages);
  const [nutrition, setNutrition] = useState(initialNutritionPlan);
  const [meals, setMeals] = useState<MealEntry[]>(initialMealLogs);
  const [workout, setWorkout] = useState<WorkoutSession>(initialWorkoutSession);
  const [syncing, setSyncing] = useState(false);

  const handleSyncTelemetry = async () => {
    setSyncing(true);
    try {
      const live = await fetchGoogleFitTelemetry();
      setTelemetry(live);
    } finally {
      setSyncing(false);
    }
  };

  const handleAddMeal = (newMeal: MealEntry) => {
    setMeals((prev) => [newMeal, ...prev]);
    setNutrition((prev) => ({
      ...prev,
      currentCalories: prev.currentCalories + newMeal.calories,
      currentProtein: prev.currentProtein + newMeal.protein,
      currentCarbs: prev.currentCarbs + newMeal.carbs,
      currentFats: prev.currentFats + newMeal.fats,
    }));
  };

  const handleAddWater = (amountMl: number) => {
    setNutrition((prev) => ({
      ...prev,
      currentWaterMl: prev.currentWaterMl + amountMl,
    }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <BiometricReadinessHeader
        telemetry={telemetry}
        onSync={handleSyncTelemetry}
        syncing={syncing}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SmartNutritionPlanner
          plan={nutrition}
          meals={meals}
          onAddMeal={handleAddMeal}
          onAddWater={handleAddWater}
        />
        <MedicalSleepMonitor stages={stages} />
      </div>

      <GymCoachAndEquipment
        session={workout}
        onUpdateSession={setWorkout}
      />

      <GymCardioPlanner />

      <MedicalReportAnalyzer onSpawnTask={onSpawnTask} />
    </div>
  );
}
