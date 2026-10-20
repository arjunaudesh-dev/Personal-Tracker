import { NextRequest, NextResponse } from 'next/server';
import { nexusAi } from '@/lib/ai-service';

export async function POST(req: NextRequest) {
  try {
    let reportText = 'Clinical Lab Report blood panel';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      reportText = body.text || body.content || reportText;
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (file) {
        reportText = `Attached File: ${file.name} (${file.size} bytes)`;
      }
    }

    const report = await nexusAi.analyzeBloodwork(reportText);
    return NextResponse.json({ success: true, report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown clinical parsing failure';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
