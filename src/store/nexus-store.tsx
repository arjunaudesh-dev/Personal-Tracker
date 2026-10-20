'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type { NexusState } from './nexus-reducer';
import { nexusReducer } from './nexus-reducer';
import { loadPersistedState, persistState } from './nexus-persist';

import { createInitialTasks, INITIAL_LINKS } from '@/components/mindmap/mock-data';
import {
  createMockTransactions,
  LINKED_TASK_SEEDS,
} from '@/components/finance/mock-finance-data';
import {
  createMockBiometrics,
  createMockMeals,
  createMockWorkouts,
  SAMPLE_LAB_REPORT,
} from '@/components/health/mock-health-data';
import { isoDate, uid } from '@/lib/parser/utils';

interface NexusContextValue {
  state: NexusState;
  ready: boolean;
  dispatch: React.Dispatch<Parameters<typeof nexusReducer>[1]>;
  reset: () => void;
}

const NexusContext = createContext<NexusContextValue | null>(null);

function buildInitialState(): NexusState {
  const tasks = createInitialTasks();
  const transactions = createMockTransactions();
  const today = isoDate();

  LINKED_TASK_SEEDS.forEach((seed, index) => {
    transactions.unshift({
      id: uid('tx'),
      date: addDaysSafe(today, -index),
      amount: seed.amount,
      currency: 'USD',
      title: seed.title,
      category: seed.category,
      bucket: seed.bucket,
      type: 'expense',
      linkedTaskId: seed.taskId,
      status: 'settled',
      createdAt: new Date().toISOString(),
    });
  });

  return {
    tasks,
    links: INITIAL_LINKS,
    transactions,
    biometrics: createMockBiometrics(),
    workouts: createMockWorkouts(),
    meals: createMockMeals(),
    labs: [SAMPLE_LAB_REPORT],
    currency: 'USD',
    activeBoardId: 'master',
    activeSpaceId: 'all',
    selectedTaskId: null,
    activeModule: 'briefing',
    systemHealth: [],
  };
}

function addDaysSafe(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function NexusProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(nexusReducer, null as unknown as NexusState, buildInitialState);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted) dispatch({ type: 'hydrate', state: persisted });
    hydrated.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const timer = window.setTimeout(() => persistState(state), 350);
    return () => window.clearTimeout(timer);
  }, [state]);

  const reset = useCallback(() => {
    window.localStorage.removeItem('nexus-life-os:state:v1');
    dispatch({ type: 'hydrate', state: buildInitialState() });
  }, []);

  const value = useMemo<NexusContextValue>(
    () => ({ state, ready, dispatch, reset }),
    [state, ready, reset],
  );

  return <NexusContext.Provider value={value}>{children}</NexusContext.Provider>;
}

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error('useNexus must be used inside <NexusProvider>');
  return ctx;
}

export function useNexusState() {
  return useNexus().state;
}

export function useNexusDispatch() {
  return useNexus().dispatch;
}
