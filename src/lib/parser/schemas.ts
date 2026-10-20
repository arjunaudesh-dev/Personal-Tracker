/**
 * NEXUS LIFE-OS — Zod runtime validation schemas (webhooks, telemetry, forms, AI payloads).
 */

import { z } from 'zod';

export const currencySchema = z.enum(['USD', 'LKR']);

export const transactionSchema = z.object({
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number().nonnegative(),
  currency: currencySchema,
  title: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  bucket: z.enum(['needs', 'wants', 'savings']),
  type: z.enum(['income', 'expense']),
  linkedTaskId: z.string().nullable(),
  status: z.enum(['settled', 'pending', 'overdue']).default('settled'),
});

export const taskPatchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(255).optional(),
  status: z.enum(['todo', 'in-progress', 'blocked', 'done', 'archived']).optional(),
  priority: z.enum(['critical', 'high', 'medium', 'low']).optional(),
  progress: z.number().min(0).max(100).optional(),
  notes: z.string().max(20_000).optional(),
  dueDate: z.string().nullable().optional(),
});

export const biometricSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  steps: z.number().nonnegative(),
  restingHr: z.number().min(20).max(220),
  activeHr: z.number().min(20).max(220),
  caloriesBurned: z.number().nonnegative(),
  sleepMinutes: z.number().min(0).max(1_440),
  hydrationMl: z.number().min(0).max(20_000),
});

export const telemetryBatchSchema = z.object({
  days: z.array(biometricSchema).min(1).max(400),
  source: z.enum(['google-fit', 'health-connect', 'simulated']).default('simulated'),
});

export const boqLineSchema = z.object({
  description: z.string().min(1),
  unit: z.string().min(1),
  quantity: z.number().nonnegative(),
  rate: z.number().nonnegative(),
  currency: currencySchema,
});

export const aiRequestSchema = z.object({
  task: z.enum([
    'financial-advice',
    'war-room',
    'clinical-review',
    'meal-plan',
    'subtask-draft',
    'workout-review',
  ]),
  payload: z.record(z.unknown()).default({}),
});

export const labExtractionSchema = z.object({
  summary: z.string(),
  biomarkers: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        value: z.number(),
        unit: z.string(),
        refLow: z.number(),
        refHigh: z.number(),
        category: z.enum(['lipid', 'glycemic', 'organ', 'hormone', 'vitamin']),
      }),
    )
    .default([]),
  flags: z.array(z.string()).default([]),
});

export type AiRequest = z.infer<typeof aiRequestSchema>;
export type LabExtraction = z.infer<typeof labExtractionSchema>;
export type TaskPatch = z.infer<typeof taskPatchSchema>;
