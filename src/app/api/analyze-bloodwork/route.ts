import { NextResponse } from 'next/server';
import { z } from 'zod';
import { REFERENCE } from '@/lib/biomarkers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/webp']);
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const resultSchema = z.object({
  biomarkers: z.array(z.object({ name: z.string(), value: z.number().finite(), unit: z.string().optional() })).max(60),
});

const responseSchema = {
  type: 'OBJECT',
  properties: {
    biomarkers: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { name: { type: 'STRING' }, value: { type: 'NUMBER' }, unit: { type: 'STRING' } },
        required: ['name', 'value'],
      },
    },
  },
  required: ['biomarkers'],
};

const PROMPT = `You are extracting numeric results from a clinical laboratory report.
Return only biomarkers you can read with certainty. Use these canonical names when they match:
${Object.keys(REFERENCE).join(', ')}.
Convert values to the unit shown on the report where possible. Do not infer or invent values.`;

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Upload a PDF or image in the "file" field.' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported type ${file.type || 'unknown'}.` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB.' }, { status: 413 });
  }
  if (!apiKey) {
    return NextResponse.json({ mode: 'offline', biomarkers: [], message: 'GEMINI_API_KEY is not set. Use manual entry, or add the key to .env.local to enable automatic extraction.' });
  }

  const model = process.env.GEMINI_PRO_MODEL || 'gemini-2.5-pro';
  const data = Buffer.from(await file.arrayBuffer()).toString('base64');

  try {
    const res = await fetch(`${GEMINI_BASE}/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: PROMPT }, { inlineData: { mimeType: file.type, data } }] }],
        generationConfig: { responseMimeType: 'application/json', responseSchema, temperature: 0 },
      }),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const status = res.status === 429 ? 429 : 502;
      return NextResponse.json({ error: `Gemini returned ${res.status}. Try again shortly.` }, { status });
    }
    const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const parsed = resultSchema.safeParse(JSON.parse(text));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Model output did not match the expected schema.' }, { status: 502 });
    }
    const biomarkers = parsed.data.biomarkers.filter((b) => b.name in REFERENCE);
    return NextResponse.json({ mode: 'gemini', model, biomarkers });
  } catch {
    return NextResponse.json({ error: 'Analysis failed or timed out.' }, { status: 502 });
  }
}
