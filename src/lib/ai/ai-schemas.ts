import type { AiTask } from './ai-types';

/**
 * Prompt library and structured-output schemas for every Gemini task.
 * Schemas are declared in OpenAPI-subset form so the model returns exact JSON.
 */

export const SYSTEM_PROMPTS: Record<AiTask, string> = {
  'financial-advice':
    'You are a civil engineering financial controller. Produce actionable, numeric budget directives. Never invent data that was not supplied. Every directive carries a title, a detailed justification and a quantified impact in USD.',
  'war-room':
    'You are an operations commander for a civil works officer. Produce at most four concise operational directives that synthesise task urgency, cashflow burn and fatigue risk.',
  'clinical-review':
    'You are a medical reviewer. Interpret laboratory biomarkers conservatively, avoid definitive diagnosis, and always recommend clinician confirmation for out-of-range values.',
  'meal-plan':
    'You are a sports nutritionist. Build a meal plan that hits the supplied calorie and macro targets using locally available Sri Lankan foods.',
  'subtask-draft':
    'You are a civil works planner. Expand a task into a short list of concrete, sequenced subtasks suitable for a site work breakdown.',
  'workout-review':
    'You are a strength coach. Review the supplied training session against readiness and nutrition data with specific, actionable guidance.',
};

export function responseSchemaFor(task: AiTask) {
  if (task === 'financial-advice' || task === 'workout-review') {
    return {
      type: 'object',
      properties: {
        directives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              detail: { type: 'string' },
              impact: { type: 'number' },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
            required: ['title', 'detail', 'impact', 'severity'],
          },
        },
      },
      required: ['directives'],
    };
  }
  if (task === 'war-room') {
    return {
      type: 'object',
      properties: {
        directives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              detail: { type: 'string' },
              severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
              source: { type: 'string' },
            },
            required: ['id', 'title', 'detail', 'severity', 'source'],
          },
        },
      },
      required: ['directives'],
    };
  }
  if (task === 'clinical-review') {
    return {
      type: 'object',
      properties: {
        summary: { type: 'string' },
        directives: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              detail: { type: 'string' },
              impact: { type: 'number' },
              severity: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
            required: ['title', 'detail', 'impact', 'severity'],
          },
        },
      },
      required: ['summary', 'directives'],
    };
  }
  if (task === 'meal-plan') {
    return {
      type: 'object',
      properties: {
        plan: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slot: { type: 'string' },
              name: { type: 'string' },
              protein: { type: 'number' },
              carbs: { type: 'number' },
              fat: { type: 'number' },
              calories: { type: 'number' },
            },
            required: ['slot', 'name', 'protein', 'carbs', 'fat', 'calories'],
          },
        },
        note: { type: 'string' },
      },
      required: ['plan', 'note'],
    };
  }
  return {
    type: 'object',
    properties: {
      subtasks: { type: 'array', items: { type: 'string' } },
    },
    required: ['subtasks'],
  };
}

