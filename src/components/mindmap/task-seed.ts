import type { GroupCategory, TaskPriority, TaskStatus } from '@/lib/types/mindmap';

/**
 * Seed contract shared by the civil works, health and life-administration task
 * trees that make up the mind-map graph.
 */
export interface CivilTaskSeed {
  key: string;
  parent: string | null;
  title: string;
  category: GroupCategory;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  notes: string;
  dueInDays?: number;
  estimatedCost?: number;
  actualSpend?: number;
  committed?: number;
}
