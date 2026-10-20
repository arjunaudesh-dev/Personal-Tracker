import type { NexusState } from './nexus-reducer';

const STORAGE_KEY = 'nexus-life-os:state:v1';

type PersistedShape = Partial<
  Pick<
    NexusState,
    | 'tasks'
    | 'links'
    | 'transactions'
    | 'biometrics'
    | 'workouts'
    | 'meals'
    | 'labs'
    | 'currency'
    | 'activeBoardId'
    | 'activeSpaceId'
  >
>;

export function loadPersistedState(): PersistedShape | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedShape;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function persistState(state: NexusState) {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedShape = {
      tasks: state.tasks,
      links: state.links,
      transactions: state.transactions,
      biometrics: state.biometrics,
      workouts: state.workouts,
      meals: state.meals,
      labs: state.labs,
      currency: state.currency,
      activeBoardId: state.activeBoardId,
      activeSpaceId: state.activeSpaceId,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota exceeded — the app keeps working from memory */
  }
}

export function clearPersistedState() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
