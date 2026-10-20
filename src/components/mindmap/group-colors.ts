import type { GroupCategory, TaskStatus } from '@/lib/types/mindmap';

/** Accent colour per task group — used by nodes, legends and badges. */
export const GROUP_COLOR: Record<GroupCategory, string> = {
  Work: '#a78bfa',
  Health: '#34d399',
  Finance: '#fbbf24',
  Career: '#fb7185',
  Personal: '#38bdf8',
  System: '#22d3ee',
};

/** Sort weight used when ordering tasks by urgency. */
export const STATUS_WEIGHT: Record<TaskStatus, number> = {
  todo: 0,
  'in-progress': 1,
  blocked: 2,
  done: 3,
  archived: 0,
};
