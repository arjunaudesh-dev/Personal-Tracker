export type TaskStatus = 'todo' | 'doing' | 'done';
export type Priority = 'low' | 'medium' | 'high';
export type Group = 'Civil' | 'Health' | 'Finance' | 'Personal';
export type Bucket = 'needs' | 'wants' | 'savings';
export type TxType = 'income' | 'expense';
export type Currency = 'USD' | 'LKR';

export interface Task {
  id: string;
  parentId: string | null;
  title: string;
  notes: string;
  group: Group;
  status: TaskStatus;
  priority: Priority;
  /** Bill-of-quantities style cost lines (qty x rate). */
  boq: BoqItem[];
  dueDate: string | null; // ISO date (yyyy-mm-dd)
  collapsed: boolean;
  createdAt: string;
}

export interface BoqItem {
  id: string;
  item: string;
  qty: number;
  rate: number; // USD
}

export interface Transaction {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  amount: number; // always stored in USD
  type: TxType;
  bucket: Bucket;
  category: string;
  linkedTaskId: string | null;
}

export interface Meal {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
}

export interface WorkoutSet {
  id: string;
  date: string;
  exercise: string;
  split: 'Push' | 'Pull' | 'Legs' | 'Civil Conditioning';
  sets: number;
  reps: number;
  weightKg: number;
  rpe: number;
}

export interface Profile {
  name: string;
  sex: 'male' | 'female';
  age: number;
  heightCm: number;
  weightKg: number;
  activity: number; // PAL multiplier 1.2 – 1.9
  goal: 'cut' | 'maintain' | 'bulk';
}

export interface Biomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
  category: 'Lipid' | 'Glycemic' | 'Organ' | 'Micronutrient' | 'Hormone' | 'Other';
  flagged?: boolean;
}

export interface NexusState {
  tasks: Task[];
  transactions: Transaction[];
  meals: Meal[];
  workouts: WorkoutSet[];
  profile: Profile;
  biomarkers: Biomarker[];
  monthlyIncome: number; // USD
  currency: Currency;
  sleepScore: number;
}
