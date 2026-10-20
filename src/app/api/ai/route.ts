import { NextResponse } from 'next/server';

import { aiRequestSchema } from '@/lib/parser/schemas';
import { runNexusAi } from '@/lib/ai/ai-service';

export const runtime = 'nodejs';
export const maxDuration = 45;

/** Unified AI execution endpoint for every AI surface in the platform. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid AI request.', detail: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await runNexusAi(parsed.data.task, parsed.data.payload);

    return NextResponse.json({
      data: result.data,
      source: result.source,
      model: result.model,
      cached: result.cached,
      elapsedMs: result.elapsedMs,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI request failed.' },
      { status: 500 },
    );
  }
}
