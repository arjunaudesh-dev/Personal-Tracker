import type { NexusState, Task, Transaction, Meal, WorkoutSet } from '@/types/nexus';
import { daysAgoISO } from './utils';
import { buildBiomarkers } from './biomarkers';

const t = (
  id: string, parentId: string | null, title: string, group: Task['group'],
  status: Task['status'], priority: Task['priority'], boq: Task['boq'] = [], notes = '',
): Task => ({ id, parentId, title, group, status, priority, boq, notes, dueDate: null, collapsed: false, createdAt: '2026-10-01' });

export const SEED_TASKS: Task[] = [
  t('civ-root', null, 'Civil Works Programme', 'Civil', 'doing', 'high'),
  t('civ-dock', 'civ-root', 'Harbor Floating Dock Mooring', 'Civil', 'doing', 'high', [
    { id: 'b1', item: 'Mooring anchor overhaul (labour)', qty: 4, rate: 220 },
    { id: 'b2', item: 'Galvanised chain (m)', qty: 60, rate: 14 },
  ], 'Inspection, tidal tension analysis, anchor overhaul.'),
  t('civ-dock-insp', 'civ-dock', 'Tidal tension analysis', 'Civil', 'done', 'medium'),
  t('civ-dock-anchor', 'civ-dock', 'Mooring anchor overhaul', 'Civil', 'doing', 'high'),
  t('civ-wall', 'civ-root', 'Sea Wall Tidal Armouring', 'Civil', 'todo', 'high', [
    { id: 'b3', item: 'Rip-rap boulders (t)', qty: 120, rate: 26 },
    { id: 'b4', item: 'Geotextile membrane (m²)', qty: 300, rate: 3.5 },
  ]),
  t('civ-wall-geo', 'civ-wall', 'Geotextile membrane laying', 'Civil', 'todo', 'medium'),
  t('civ-wall-rip', 'civ-wall', 'Rip-rap boulder placement', 'Civil', 'todo', 'medium'),
  t('civ-admin', 'civ-root', 'Admin Building 1st Floor Slab', 'Civil', 'doing', 'high', [
    { id: 'b5', item: 'Wire nails (kg)', qty: 40, rate: 2.2 },
    { id: 'b6', item: 'Formwork hire (days)', qty: 14, rate: 60 },
  ]),
  t('civ-admin-form', 'civ-admin', 'Shuttering & formworks', 'Civil', 'done', 'medium'),
  t('civ-admin-nails', 'civ-admin', 'Wire nails procurement', 'Civil', 'doing', 'low'),
  t('civ-admin-nhq', 'civ-admin', 'NHQ concurrence letters', 'Civil', 'todo', 'high'),

  t('hl-root', null, 'Health & Athletics', 'Health', 'doing', 'high'),
  t('hl-bw', 'hl-root', 'Quarterly bloodwork review', 'Health', 'todo', 'high'),
  t('hl-vitd', 'hl-bw', 'Vitamin D3 supplementation (corrective)', 'Health', 'todo', 'medium'),
  t('hl-gym', 'hl-root', 'Push / Pull / Legs split', 'Health', 'doing', 'medium'),
  t('hl-sleep', 'hl-root', 'Sleep hygiene — 7.5 h target', 'Health', 'doing', 'medium'),

  t('fin-root', null, 'Budget & Cash-flow', 'Finance', 'doing', 'high'),
  t('fin-emerg', 'fin-root', 'Build emergency fund (3 months)', 'Finance', 'doing', 'high'),
  t('fin-debt', 'fin-root', 'Clear personal loan', 'Finance', 'todo', 'medium'),
];

const d = daysAgoISO;
export const SEED_TRANSACTIONS: Transaction[] = [
  { id: 'tx1', date: d(28), title: 'Monthly salary', amount: 3000, type: 'income', bucket: 'needs', category: 'Salary', linkedTaskId: null },
  { id: 'tx2', date: d(27), title: 'Rent — Colombo 05', amount: 900, type: 'expense', bucket: 'needs', category: 'Housing', linkedTaskId: null },
  { id: 'tx3', date: d(26), title: 'Groceries', amount: 210, type: 'expense', bucket: 'needs', category: 'Food', linkedTaskId: null },
  { id: 'tx4', date: d(24), title: 'Electricity & water', amount: 70, type: 'expense', bucket: 'needs', category: 'Utilities', linkedTaskId: null },
  { id: 'tx5', date: d(22), title: 'Site PPE & boots', amount: 145, type: 'expense', bucket: 'needs', category: 'Civil', linkedTaskId: 'civ-admin' },
  { id: 'tx6', date: d(20), title: 'Gym membership', amount: 60, type: 'expense', bucket: 'wants', category: 'Fitness', linkedTaskId: 'hl-gym' },
  { id: 'tx7', date: d(16), title: 'Weekend trip — Ella', amount: 180, type: 'expense', bucket: 'wants', category: 'Leisure', linkedTaskId: null },
  { id: 'tx8', date: d(12), title: 'Mooring chain (60 m)', amount: 840, type: 'expense', bucket: 'needs', category: 'Civil', linkedTaskId: 'civ-dock' },
  { id: 'tx9', date: d(9), title: 'Emergency fund transfer', amount: 400, type: 'expense', bucket: 'savings', category: 'Savings', linkedTaskId: 'fin-emerg' },
  { id: 'tx10', date: d(5), title: 'Freelance survey fee', amount: 350, type: 'income', bucket: 'needs', category: 'Side income', linkedTaskId: null },
  { id: 'tx11', date: d(3), title: 'Dining out', amount: 75, type: 'expense', bucket: 'wants', category: 'Food', linkedTaskId: null },
  { id: 'tx12', date: d(1), title: 'Fuel', amount: 48, type: 'expense', bucket: 'needs', category: 'Transport', linkedTaskId: null },
];

const meal = (id: string, date: string, name: string, calories: number, protein: number): Meal => ({ id, date, name, calories, protein });
export const SEED_MEALS: Meal[] = [
  meal('m1', d(0), 'Egg hoppers & dhal', 520, 28),
  meal('m2', d(0), 'Chicken rice bowl', 640, 46),
  meal('m3', d(1), 'Greek yoghurt + oats', 410, 34),
];

const w = (id: string, date: string, exercise: string, split: WorkoutSet['split'], sets: number, reps: number, weightKg: number, rpe: number): WorkoutSet => ({ id, date, exercise, split, sets, reps, weightKg, rpe });
export const SEED_WORKOUTS: WorkoutSet[] = [
  w('w1', d(2), 'Bench Press', 'Push', 4, 6, 80, 8),
  w('w2', d(2), 'Overhead Press', 'Push', 3, 8, 45, 7.5),
  w('w3', d(4), 'Barbell Row', 'Pull', 4, 8, 70, 8),
  w('w4', d(4), 'Pull-up', 'Pull', 3, 6, 0, 8),
  w('w5', d(6), 'Back Squat', 'Legs', 4, 5, 100, 8.5),
  w('w6', d(6), 'Romanian Deadlift', 'Legs', 3, 8, 90, 7.5),
];

export const SEED_STATE: NexusState = {
  packages: [],
  tasks: SEED_TASKS,
  transactions: SEED_TRANSACTIONS,
  meals: SEED_MEALS,
  workouts: SEED_WORKOUTS,
  profile: { name: 'Arjuna', sex: 'male', age: 32, heightCm: 176, weightKg: 82, activity: 1.55, goal: 'maintain' },
  biomarkers: buildBiomarkers([
    { name: 'Total Cholesterol', value: 214 },
    { name: 'HDL', value: 38 },
    { name: 'LDL', value: 138 },
    { name: 'Triglycerides', value: 190 },
    { name: 'Fasting Glucose', value: 92 },
    { name: 'HbA1c', value: 5.4 },
    { name: 'ALT (SGPT)', value: 28 },
    { name: 'AST (SGOT)', value: 24 },
    { name: 'Creatinine', value: 0.95 },
    { name: 'Vitamin D (25-OH)', value: 22 },
    { name: 'Vitamin B12', value: 480 },
  ]),
  monthlyIncome: 3000,
  currency: 'USD',
  sleepScore: 88,
};
