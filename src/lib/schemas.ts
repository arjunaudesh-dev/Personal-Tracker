import { z } from 'zod';

export const TaskNodeSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  title: z.string().min(1, 'Task title required').max(255),
  groupCategory: z.enum(['Work', 'Finance', 'Health', 'Personal', 'Civil']),
  status: z.enum(['todo', 'in_progress', 'blocked', 'done']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  progress: z.number().min(0).max(100),
  markdownNotes: z.string().optional(),
  dueDate: z.string().optional(),
  cashflow: z.object({
    estimatedCost: z.number().default(0),
    actualSpend: z.number().default(0),
    currency: z.enum(['USD', 'LKR']).default('USD'),
  }).optional(),
});

export const TransactionSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)),
  date: z.string(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'LKR']),
  title: z.string().min(1, 'Title is required').max(255),
  category: z.string().min(1),
  bucket: z.enum(['needs', 'wants', 'savings']),
  type: z.enum(['income', 'expense']),
  linkedTaskId: z.string().optional(),
  status: z.enum(['settled', 'pending', 'projected']),
});

export const BloodworkReportSchema = z.object({
  testDate: z.string(),
  labName: z.string().min(1),
  biomarkers: z.array(z.object({
    name: z.string(),
    category: z.enum(['Lipid', 'Glycemic', 'Organ', 'Micronutrient', 'Hormone']),
    value: z.number(),
    unit: z.string(),
    referenceRange: z.string(),
    status: z.enum(['optimal', 'borderline', 'critical']),
  })),
  clinicalInterpretation: z.string(),
});

export const MealEntrySchema = z.object({
  name: z.string().min(1),
  calories: z.number().nonnegative(),
  protein: z.number().nonnegative(),
  carbs: z.number().nonnegative(),
  fats: z.number().nonnegative(),
});
