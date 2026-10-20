import type { BoardDefinition, TaskSpace } from '@/lib/types/mindmap';

/** Multi-board workspace definitions for the mind-map engine. */
export const BOARDS: BoardDefinition[] = [
  {
    id: 'master',
    name: 'Master Command',
    subtitle: 'All systems · unified graph',
    color: '#22d3ee',
    accent: 'rgba(34,211,238,0.16)',
  },
  {
    id: 'work',
    name: 'Civil Works',
    subtitle: 'Harbour · sea wall · slab',
    color: '#a78bfa',
    accent: 'rgba(167,139,250,0.16)',
  },
  {
    id: 'health',
    name: 'Health & Athletic',
    subtitle: 'Telemetry · training · nutrition',
    color: '#34d399',
    accent: 'rgba(52,211,153,0.16)',
  },
  {
    id: 'finance',
    name: 'Financial Command',
    subtitle: 'Budget · cashflow · debt',
    color: '#fbbf24',
    accent: 'rgba(251,191,36,0.16)',
  },
  {
    id: 'carbon',
    name: 'Career & Life',
    subtitle: 'Licensing · CRM · life admin',
    color: '#fb7185',
    accent: 'rgba(251,113,133,0.16)',
  },
];

/** Task-space filter pills shown in the space bar. */
export const TASK_SPACES: TaskSpace[] = [
  { id: 'all', label: 'All Spaces', groupCategory: 'System' },
  { id: 'work', label: 'Civil Works', groupCategory: 'Work' },
  { id: 'health', label: 'Health', groupCategory: 'Health' },
  { id: 'finance', label: 'Finance', groupCategory: 'Finance' },
  { id: 'career', label: 'Career', groupCategory: 'Career' },
  { id: 'personal', label: 'Personal', groupCategory: 'Personal' },
  { id: 'system', label: 'System Ops', groupCategory: 'System' },
];

export const BOARD_BY_ID: Record<string, BoardDefinition> = BOARDS.reduce(
  (acc, board) => {
    acc[board.id] = board;
    return acc;
  },
  {} as Record<string, BoardDefinition>,
);

/** Map a group category onto the board that owns it. */
export const CATEGORY_BOARD: Record<string, string> = {
  Work: 'work',
  Health: 'health',
  Finance: 'finance',
  Career: 'carbon',
  Personal: 'carbon',
  System: 'work',
};
