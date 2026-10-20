import { GoogleGenAI } from '@google/genai';

import { AiCache, aiCache } from './cache-manager';
import { acquireToken, withRetry } from './rate-limiter';
import {
  localFinancialAdvice,
  localWarRoom,
} from './local-engine';
import {
  localClinicalReview,
  localMealPlan,
  localSubtasks,
  localWorkoutReview,
} from './local-clinical-engine';
import { SYSTEM_PROMPTS, responseSchemaFor } from './ai-schemas';
import type { AiTask } from './ai-types';

export type { AiTask } from './ai-types';

export interface AiRunResult<T> {
  data: T;
  source: 'gemini' | 'local';
  model: string;
  cached: boolean;
  elapsedMs: number;
}

const FLASH = process.env.GEMINI_FLASH_MODEL || 'gemini-2.5-flash';
const PRO = process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro';

/** Deep clinical reasoning is reserved for the low-RPM pro model. */
export function modelFor(task: AiTask) {
  return task === 'clinical-review' || task === 'war-room' ? PRO : FLASH;
}

let client: GoogleGenAI | null = null;

export function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

export function isAiAvailable() {
  return Boolean(process.env.GEMINI_API_KEY);
}

async function callGemini<T>(task: AiTask, payload: unknown): Promise<T> {
  const ai = getClient();
  if (!ai) throw new Error('GEMINI_API_KEY not configured');
  const model = modelFor(task);
  await acquireToken(model);

  const response = await withRetry(
    () =>
      ai.models.generateContent({
        model,
        contents: `${SYSTEM_PROMPTS[task]}\n\nINPUT DATA (JSON):\n${JSON.stringify(payload, null, 2)}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchemaFor(task),
          temperature: task === 'clinical-review' ? 0.2 : 0.55,
        },
      }),
    { attempts: 3 },
  );

  const text = response.text;
  if (!text) throw new Error('Empty model response');
  return JSON.parse(text) as T;
}

/**
 * Unified AI executor. Attempts Gemini first, falls back to the deterministic
 * local engine so that every surface keeps working without an API key.
 */
export async function runNexusAi<T = unknown>(
  task: AiTask,
  payload: unknown,
): Promise<AiRunResult<T>> {
  const started = Date.now();
  const cacheKey = AiCache.key([task, JSON.stringify(payload)]);
  const cached = aiCache.get<T>(cacheKey);
  if (cached !== null) {
    return {
      data: cached,
      source: 'gemini',
      model: modelFor(task),
      cached: true,
      elapsedMs: Date.now() - started,
    };
  }

  if (isAiAvailable()) {
    try {
      const data = await callGemini<T>(task, payload);
      aiCache.set(cacheKey, data);
      return {
        data,
        source: 'gemini',
        model: modelFor(task),
        cached: false,
        elapsedMs: Date.now() - started,
      };
    } catch {
      /* fall through to the deterministic engine */
    }
  }

  const data = localFallback(task, payload) as T;
  return {
    data,
    source: 'local',
    model: 'nexus-local-engine',
    cached: false,
    elapsedMs: Date.now() - started,
  };
}

/** Deterministic engine dispatch — mirrors the Gemini output contract exactly. */
export function localFallback(task: AiTask, payload: unknown) {
  const p = (payload ?? {}) as Record<string, never>;
  switch (task) {
    case 'financial-advice':
      return { directives: localFinancialAdvice(p as never) };
    case 'war-room':
      return { directives: localWarRoom(p as never) };
    case 'clinical-review':
      return localClinicalReview(p as never);
    case 'meal-plan':
      return { plan: localMealPlan(p as never).plan, note: localMealPlan(p as never).note };
    case 'subtask-draft':
      return localSubtasks(p as never);
    case 'workout-review':
      return localWorkoutReview(p as never);
    default:
      return {};
  }
}
