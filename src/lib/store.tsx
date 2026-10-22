'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { NexusState, MonthlyPackage, Task, Transaction, Meal, WorkoutSet, Profile, Biomarker, Currency } from '@/types/nexus';
import { SEED_STATE } from './seed';
import { removeSubtree, computeRollup } from './rollup';
import { uid } from './utils';

const STORAGE_KEY = 'nexus-life-os:v2';

export interface NexusActions {
  savePackage: (item: MonthlyPackage, month: string) => void;
  removePackage: (id: string) => void;
  addTask: (t: Partial<Task> & { title: string; parentId?: string | null }) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleCollapse: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addMeal: (m: Omit<Meal, 'id'>) => void;
  addWorkout: (w: Omit<WorkoutSet, 'id'>) => void;
  setProfile: (p: Partial<Profile>) => void;
  setBiomarkers: (b: Biomarker[]) => void;
  setCurrency: (c: Currency) => void;
  setMonthlyIncome: (n: number) => void;
  reset: () => void;
}

interface StoreValue extends NexusActions {
  state: NexusState;
  hydrated: boolean;
  progress: Map<string, { progress: number; depth: number; children: string[] }>;
}

const Ctx = createContext<StoreValue | null>(null);

export function NexusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<NexusState>(SEED_STATE);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (keeps server and first client render identical).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...SEED_STATE, ...(JSON.parse(raw) as Partial<NexusState>) });
    } catch {
      /* corrupt storage — fall back to seed */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or private mode — ignore */
    }
  }, [state, hydrated]);

  const update = useCallback((fn: (s: NexusState) => NexusState) => setState((s) => fn(s)), []);

  const actions: NexusActions = useMemo(() => ({
    savePackage: (item, month) => update((s) => {
      const existing = s.transactions.find((t) => t.packageId === item.id && t.billingMonth === month);
      const tx: Transaction = { id: existing?.id ?? uid('tx'), packageId: item.id, billingMonth: month,
        date: `${month}-01`, title: item.name, amount: item.amount, type: 'expense',
        bucket: item.kind === 'Subscription' ? 'wants' : 'needs', category: item.kind, linkedTaskId: null };
      return { ...s, packages: [...s.packages.filter((p) => p.id !== item.id), item],
        transactions: [...s.transactions.filter((t) => t.id !== tx.id), tx] };
    }),
    removePackage: (id) => update((s) => ({ ...s, packages: s.packages.filter((p) => p.id !== id) })),
    addTask: (t) => {
      const id = uid('task');
      update((s) => ({
        ...s,
        tasks: [
          ...s.tasks,
          {
            id, parentId: t.parentId ?? null, title: t.title, notes: t.notes ?? '', group: t.group ?? 'Personal',
            status: t.status ?? 'todo', priority: t.priority ?? 'medium', boq: t.boq ?? [], dueDate: t.dueDate ?? null,
            collapsed: false, createdAt: new Date().toISOString().slice(0, 10),
          },
        ],
      }));
      return id;
    },
    updateTask: (id, patch) => update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    deleteTask: (id) => update((s) => ({ ...s, tasks: removeSubtree(s.tasks, id), transactions: s.transactions.map((x) => (x.linkedTaskId === id ? { ...x, linkedTaskId: null } : x)) })),
    toggleCollapse: (id) => update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, collapsed: !t.collapsed } : t)) })),
    addTransaction: (tx) => update((s) => ({ ...s, transactions: [{ ...tx, id: uid('tx') }, ...s.transactions] })),
    deleteTransaction: (id) => update((s) => ({ ...s, transactions: s.transactions.filter((x) => x.id !== id) })),
    addMeal: (m) => update((s) => ({ ...s, meals: [{ ...m, id: uid('meal') }, ...s.meals] })),
    addWorkout: (w) => update((s) => ({ ...s, workouts: [{ ...w, id: uid('set') }, ...s.workouts] })),
    setProfile: (p) => update((s) => ({ ...s, profile: { ...s.profile, ...p } })),
    setBiomarkers: (b) => update((s) => ({ ...s, biomarkers: b })),
    setCurrency: (c) => update((s) => ({ ...s, currency: c })),
    setMonthlyIncome: (n) => update((s) => ({ ...s, monthlyIncome: n })),
    reset: () => setState(SEED_STATE),
  }), [update]);

  const progress = useMemo(() => computeRollup(state.tasks), [state.tasks]);

  const value = useMemo<StoreValue>(() => ({ state, hydrated, progress, ...actions }), [state, hydrated, progress, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useNexus(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useNexus must be used inside <NexusProvider>');
  return v;
}
