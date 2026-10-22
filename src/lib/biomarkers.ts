import { z } from 'zod';
import type { Biomarker } from '@/types/nexus';

/** Reference ranges used for flagging (conservative adult defaults; always confirm with the lab's own range). */
export const REFERENCE: Record<string, { unit: string; low?: number; high?: number; category: Biomarker['category'] }> = {
  'Total Cholesterol': { unit: 'mg/dL', high: 200, category: 'Lipid' },
  HDL: { unit: 'mg/dL', low: 40, category: 'Lipid' },
  LDL: { unit: 'mg/dL', high: 130, category: 'Lipid' },
  Triglycerides: { unit: 'mg/dL', high: 150, category: 'Lipid' },
  'Fasting Glucose': { unit: 'mg/dL', low: 70, high: 99, category: 'Glycemic' },
  HbA1c: { unit: '%', high: 5.6, category: 'Glycemic' },
  'ALT (SGPT)': { unit: 'U/L', high: 40, category: 'Organ' },
  'AST (SGOT)': { unit: 'U/L', high: 40, category: 'Organ' },
  Creatinine: { unit: 'mg/dL', low: 0.6, high: 1.3, category: 'Organ' },
  eGFR: { unit: 'mL/min', low: 60, category: 'Organ' },
  'Vitamin D (25-OH)': { unit: 'ng/mL', low: 30, high: 100, category: 'Micronutrient' },
  'Vitamin B12': { unit: 'pg/mL', low: 200, high: 900, category: 'Micronutrient' },
  'Total Testosterone': { unit: 'ng/dL', low: 300, high: 1000, category: 'Hormone' },
};

export const biomarkerInputSchema = z.object({
  name: z.string().min(1).max(60),
  value: z.number().finite().nonnegative(),
});

export function flagBiomarker(name: string, value: number): { flagged: boolean; reason: string } {
  const ref = REFERENCE[name];
  if (!ref) return { flagged: false, reason: 'No reference range configured' };
  if (ref.low !== undefined && value < ref.low) return { flagged: true, reason: `Below ${ref.low} ${ref.unit}` };
  if (ref.high !== undefined && value > ref.high) return { flagged: true, reason: `Above ${ref.high} ${ref.unit}` };
  return { flagged: false, reason: 'Within range' };
}

/** Derived lipid ratio TG/HDL (elevated when > 3.5 per common cardiometabolic guidance). */
export function tgHdlRatio(list: Biomarker[]): number | null {
  const tg = list.find((b) => b.name === 'Triglycerides')?.value;
  const hdl = list.find((b) => b.name === 'HDL')?.value;
  if (!tg || !hdl) return null;
  return Math.round((tg / hdl) * 100) / 100;
}

export function buildBiomarkers(entries: { name: string; value: number }[]): Biomarker[] {
  return entries.flatMap((e) => {
    const ref = REFERENCE[e.name];
    if (!ref) return [];
    const { flagged } = flagBiomarker(e.name, e.value);
    return [{ id: `bm-${e.name.replace(/\W+/g, '-').toLowerCase()}`, name: e.name, value: e.value, unit: ref.unit, refLow: ref.low, refHigh: ref.high, category: ref.category, flagged }];
  });
}
