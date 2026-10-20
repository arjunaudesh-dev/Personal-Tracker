'use client';

import { AlertTriangle, Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

import type { Biomarker, LabReport } from '@/lib/types/health';
import { GlassCard, SectionHeader } from '@/components/ui/GlassCard';
import { useNexus } from '@/store/nexus-store';
import { uid } from '@/lib/parser/utils';

import { BiomarkerGrid } from './BiomarkerGrid';

function statusFor(value: number, low: number, high: number): Biomarker['status'] {
  if (value < low * 0.75 || value > high * 1.5) return 'critical';
  if (value < low || value > high) return 'borderline';
  return 'normal';
}

/** Module D — multimodal clinical lab analyzer with corrective task spawning. */
export function MedicalReportAnalyzer() {
  const { state, dispatch } = useNexus();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [source, setSource] = useState('');

  const latest = state.labs[0];

  const analyse = async (file: File) => {
    setLoading(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/analyze-bloodwork', { method: 'POST', body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Extraction failed');
      setSource(json.source ?? 'local');

      const biomarkers: Biomarker[] = (json.data.biomarkers ?? []).map(
        (b: Biomarker) => ({ ...b, status: statusFor(b.value, b.refLow, b.refHigh) }),
      );

      const report: LabReport = {
        id: uid('lab'),
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        source: json.source === 'gemini-vision' ? 'gemini-vision' : 'local-heuristic',
        summary: json.data.summary ?? '',
        biomarkers,
        flags: json.data.flags ?? [],
      };
      dispatch({ type: 'add-lab', report });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const spawnCorrectiveTask = (biomarker: Biomarker) => {
    dispatch({
      type: 'add-task',
      task: {
        id: uid('task'),
        parentId: 'health.medical',
        boardId: 'health',
        title: `${biomarker.label} correction — ${biomarker.value} ${biomarker.unit}`,
        markdownNotes: `Auto-spawned from lab analysis. Reference range ${biomarker.refLow}–${biomarker.refHigh} ${biomarker.unit}. Status: ${biomarker.status}.`,
        groupCategory: 'Health',
        direction: 'LR',
        depth: 3,
        posX: 0,
        posY: 0,
        status: 'todo',
        priority: biomarker.status === 'critical' ? 'critical' : 'high',
        tags: ['clinical', 'auto-spawned'],
        isCollapsed: false,
        progress: 0,
        isAutoCalculated: false,
        cashflow: null,
        reminders: [],
        attachments: [latest?.fileName ?? 'lab report'],
        contacts: [],
        aiInsight: null,
        dueDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <GlassCard className="p-4" glow="cyan">
        <SectionHeader
          eyebrow="Module D · Gemini vision"
          title="Bloodwork & clinical lab analyzer"
          action={
            <span className="chip border-nexus-cyan/30 bg-nexus-cyan/10 text-nexus-cyan">
              {source || 'ready'}
            </span>
          }
        />

        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 transition-colors hover:border-nexus-cyan/45 hover:bg-white/[0.04] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-nexus-cyan" />
            ) : (
              <Upload className="h-6 w-6 text-nexus-cyan" />
            )}
            <p className="text-[12px] font-medium text-slate-200">
              {loading ? 'Extracting structured biomarkers…' : 'Upload lab report (PDF or image)'}
            </p>
            <p className="max-w-sm text-center text-[10.5px] leading-relaxed text-slate-500">
              Gemini 2.5 Vision reads the panel and returns a validated JSON extraction — lipid,
              glycemic, organ, hormone and micronutrient groups with reference ranges.
            </p>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) analyse(file);
              e.target.value = '';
            }}
          />

          <div className="space-y-3">
            <div className="glass-soft p-3">
              <p className="label-caps">Latest panel</p>
              <p className="mt-1 text-[11px] font-medium text-slate-200">
                {latest?.fileName ?? 'No report analysed yet'}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                {latest
                  ? `${new Date(latest.uploadedAt).toLocaleString()} · ${latest.biomarkers.length} biomarkers`
                  : 'Upload a report to begin'}
              </p>
              {latest ? (
                <p className="mt-2 text-[10.5px] leading-relaxed text-slate-400">{latest.summary}</p>
              ) : null}
            </div>

            {latest?.flags.length ? (
              <div className="rounded-xl border border-nexus-rose/25 bg-nexus-rose/[0.07] p-3">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-nexus-rose" />
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-rose">
                    Clinical flags ({latest.flags.length})
                  </p>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {latest.flags.map((flag, i) => (
                    <li key={i} className="text-[10.5px] leading-relaxed text-slate-300">
                      ▸ {flag}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {error ? <p className="text-[10.5px] text-nexus-rose">{error}</p> : null}
          </div>
        </div>
      </GlassCard>

      {latest ? (
        <BiomarkerGrid biomarkers={latest.biomarkers} onSpawnTask={spawnCorrectiveTask} />
      ) : null}
    </div>
  );
}
