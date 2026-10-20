import { NextResponse } from 'next/server';

import {
  isWearableConfigured,
  syncWearableWindow,
} from '@/lib/client/integrations/wearable-sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Pull a normalised telemetry window from the wearable bridge. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const days = Math.min(31, Math.max(1, Number(url.searchParams.get('days') ?? 7)));

  try {
    const telemetry = await syncWearableWindow(days);
    return NextResponse.json({
      data: telemetry,
      source: isWearableConfigured() ? 'google-fit' : 'simulated',
      days,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Wearable sync failed.' },
      { status: 500 },
    );
  }
}
