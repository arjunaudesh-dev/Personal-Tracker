/**
 * NEXUS LIFE-OS — Master type surface & cross-system snapshot contracts.
 */

export * from './mindmap';
export * from './finance';
export * from './health';

export type ModuleId = 'briefing' | 'mindmap' | 'finance' | 'health' | 'lab';

export interface SystemHealth {
  id: string;
  label: string;
  detail: string;
  status: 'operational' | 'degraded' | 'offline';
  latencyMs: number;
}

export interface NexusSnapshot {
  tasks: number;
  activeTasks: number;
  committedSpend: number;
  monthlyNet: number;
  burnRate: number;
  sleepScore: number;
  readiness: number;
  hydrationMl: number;
  openBottlenecks: number;
  currency: 'USD' | 'LKR';
}

export interface BriefingDirective {
  id: string;
  title: string;
  detail: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
}

export interface TimelineEntry {
  id: string;
  time: string;
  title: string;
  kind: 'meeting' | 'site' | 'task' | 'alarm' | 'training';
  done: boolean;
  taskId?: string;
}

export interface QuickCapturePayload {
  kind: 'expense' | 'subtask' | 'meal';
  value: string;
  amount?: number;
  category?: string;
}
