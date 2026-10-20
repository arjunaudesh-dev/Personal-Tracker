export * from './mindmap';
export * from './finance';
export * from './health';

export type SystemModule = 'briefing' | 'mindmap' | 'finance' | 'health';

export interface HolisticKpis {
  systemReadinessScore: number;
  activeBottlenecksCount: number;
  netLiquidReserveUsd: number;
  netLiquidReserveLkr: number;
  sleepRecoveryScore: number;
  dailyCaloricBurn: number;
  mindMapCompletionRate: number;
}

export interface OperationalDirective {
  id: string;
  category: 'Civil' | 'Financial' | 'Health' | 'Logistics';
  urgency: 'critical' | 'tactical' | 'maintenance';
  title: string;
  rationale: string;
  targetNodeId?: string;
}

export interface DailyScheduleSlot {
  id: string;
  time: string; // e.g. "06:00", "08:30"
  title: string;
  location?: string;
  type: 'engineering' | 'physical' | 'briefing' | 'civil_review' | 'rest';
  alarmActive: boolean;
  syncedGoogleCal: boolean;
}
