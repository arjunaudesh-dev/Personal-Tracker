import type {
  BiometricDay,
  CrossGroupLink,
  Currency,
  FinancialTransaction,
  LabReport,
  MealEntry,
  MindMapTaskNode,
  ModuleId,
  SystemHealth,
  WorkoutSession,
} from '@/lib/types/nexus';

import { rollupProgress } from '@/components/mindmap/progress-rollup';

export interface NexusState {
  tasks: MindMapTaskNode[];
  links: CrossGroupLink[];
  transactions: FinancialTransaction[];
  biometrics: BiometricDay[];
  workouts: WorkoutSession[];
  meals: MealEntry[];
  labs: LabReport[];
  currency: Currency;
  activeBoardId: string;
  activeSpaceId: string;
  selectedTaskId: string | null;
  activeModule: ModuleId;
  systemHealth: SystemHealth[];
}

export type NexusAction =
  | { type: 'hydrate'; state: Partial<NexusState> }
  | { type: 'set-module'; module: ModuleId }
  | { type: 'set-board'; boardId: string }
  | { type: 'set-space'; spaceId: string }
  | { type: 'select-task'; taskId: string | null }
  | { type: 'add-task'; task: MindMapTaskNode }
  | { type: 'update-task'; id: string; patch: Partial<MindMapTaskNode> }
  | { type: 'remove-task'; id: string }
  | { type: 'set-collapsed'; id: string; collapsed: boolean }
  | { type: 'add-link'; link: CrossGroupLink }
  | { type: 'remove-link'; id: string }
  | { type: 'add-transaction'; transaction: FinancialTransaction }
  | { type: 'update-transaction'; id: string; patch: Partial<FinancialTransaction> }
  | { type: 'remove-transaction'; id: string }
  | { type: 'add-lab'; report: LabReport }
  | { type: 'log-workout'; session: WorkoutSession }
  | { type: 'toggle-set'; sessionId: string; setId: string }
  | { type: 'log-meal'; meal: MealEntry }
  | { type: 'set-currency'; currency: Currency }
  | { type: 'set-system-health'; health: SystemHealth[] };

/** Re-compute the bottom-up progress tree after every structural mutation. */
function withRollup(tasks: MindMapTaskNode[]): MindMapTaskNode[] {
  return rollupProgress(tasks);
}

export function nexusReducer(state: NexusState, action: NexusAction): NexusState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.state };

    case 'set-module':
      return { ...state, activeModule: action.module };

    case 'set-board':
      return { ...state, activeBoardId: action.boardId, activeSpaceId: 'all' };

    case 'set-space':
      return { ...state, activeSpaceId: action.spaceId };

    case 'select-task':
      return { ...state, selectedTaskId: action.taskId };

    case 'add-task':
      return { ...state, tasks: withRollup([...state.tasks, action.task]) };

    case 'update-task':
      return {
        ...state,
        tasks: withRollup(
          state.tasks.map((t) =>
            t.id === action.id
              ? { ...t, ...action.patch, updatedAt: new Date().toISOString() }
              : t,
          ),
        ),
      };

    case 'remove-task': {
      const doomed = new Set<string>([action.id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const t of state.tasks) {
          if (t.parentId && doomed.has(t.parentId) && !doomed.has(t.id)) {
            doomed.add(t.id);
            grew = true;
          }
        }
      }
      return {
        ...state,
        tasks: withRollup(state.tasks.filter((t) => !doomed.has(t.id))),
        links: state.links.filter(
          (l) => !doomed.has(l.sourceTaskId) && !doomed.has(l.targetTaskId),
        ),
        selectedTaskId: state.selectedTaskId === action.id ? null : state.selectedTaskId,
      };
    }

    case 'set-collapsed':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, isCollapsed: action.collapsed } : t,
        ),
      };

    case 'add-link':
      return { ...state, links: [...state.links, action.link] };

    case 'remove-link':
      return { ...state, links: state.links.filter((l) => l.id !== action.id) };

    case 'add-transaction':
      return { ...state, transactions: [action.transaction, ...state.transactions] };

    case 'update-transaction':
      return {
        ...state,
        transactions: state.transactions.map((t) =>
          t.id === action.id ? { ...t, ...action.patch } : t,
        ),
      };

    case 'remove-transaction':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };

    case 'add-lab':
      return { ...state, labs: [action.report, ...state.labs] };

    case 'log-workout': {
      const exists = state.workouts.some((w) => w.id === action.session.id);
      return {
        ...state,
        workouts: exists
          ? state.workouts.map((w) => (w.id === action.session.id ? action.session : w))
          : [...state.workouts, action.session],
      };
    }

    case 'toggle-set':
      return {
        ...state,
        workouts: state.workouts.map((w) =>
          w.id === action.sessionId
            ? {
                ...w,
                sets: w.sets.map((s) =>
                  s.id === action.setId ? { ...s, completed: !s.completed } : s,
                ),
              }
            : w,
        ),
      };

    case 'log-meal':
      return { ...state, meals: [...state.meals, action.meal] };

    case 'set-currency':
      return { ...state, currency: action.currency };

    case 'set-system-health':
      return { ...state, systemHealth: action.health };

    default:
      return state;
  }
}
