'use client';

import { useMemo, useRef, useState } from 'react';
import { FlaskConical, Upload, Loader2, Plus, ListPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNexus } from '@/lib/store';
import { REFERENCE, buildBiomarkers, flagBiomarker, tgHdlRatio } from '@/lib/biomarkers';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Kpi } from '@/components/ui/Kpi';
import { cn } from '@/lib/utils';
import type { Biomarker } from '@/types/nexus';

export function BloodworkView() {
  const { state, setBiomarkers, addTask } = useNexus();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'warn'; text: string } | null>(null);
  const [manual, setManual] = useState({ name: 'HbA1c', value: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  const flagged = state.biomarkers.filter((b) => b.flagged);
  const ratio = tgHdlRatio(state.biomarkers);
  const hasTask = (b: Biomarker) => state.tasks.some((t) => t.title === correctiveTitle(b));

  const upload = async (file: File) => {
    setBusy(true);
    setNotice(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/analyze-bloodwork', { method: 'POST', body });
      const json = (await res.json()) as { biomarkers?: { name: string; value: number }[]; error?: string; message?: string; mode?: string };
      if (!res.ok || json.error) {
        setNotice({ tone: 'warn', text: json.error ?? 'Analysis failed.' });
      } else if (!json.biomarkers?.length) {
        setNotice({ tone: 'warn', text: json.message ?? 'No recognisable biomarkers found.' });
      } else {
        setBiomarkers(buildBiomarkers(json.biomarkers));
        setNotice({ tone: 'ok', text: `Extracted ${json.biomarkers.length} biomarkers (${json.mode === 'gemini' ? 'Gemini' : 'offline'}).` });
      }
    } catch {
      setNotice({ tone: 'warn', text: 'Network error while uploading.' });
    } finally {
      setBusy(false);
    }
  };

  const addManual = (e: React.FormEvent) => {
    e.preventDefault();
    const v = Number(manual.value);
    if (!(v >= 0) || manual.value === '') return;
    const next = [...state.biomarkers.filter((b) => b.name !== manual.name), ...buildBiomarkers([{ name: manual.name, value: v }])];
    setBiomarkers(next);
    setManual((m) => ({ ...m, value: '' }));
  };

  const spawn = (b: Biomarker) => {
    const { reason } = flagBiomarker(b.name, b.value);
    addTask({ title: correctiveTitle(b), parentId: 'hl-bw', group: 'Health', priority: 'high', notes: `${b.name} ${b.value} ${b.unit} — ${reason}. Discuss with clinician.` });
  };

  return (
    <>
      <PageHeader
        eyebrow="Module D · Clinical lab analyser"
        title="Bloodwork"
        description="Upload a lab report (PDF or photo) or enter values by hand. Out-of-range markers can spawn corrective tasks in your Health tree."
      />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi label="Markers tracked" value={`${state.biomarkers.length}`} sub="Latest panel" icon={FlaskConical} tone="cyan" />
        <Kpi label="Flagged" value={`${flagged.length}`} sub="Outside reference" icon={AlertTriangle} tone="pink" />
        <Kpi label="TG / HDL ratio" value={ratio === null ? '—' : ratio.toFixed(2)} sub="Elevated above 3.5" icon={AlertTriangle} tone="amber" />
        <Kpi label="Corrective tasks" value={`${state.tasks.filter((t) => t.parentId === 'hl-bw').length}`} sub="Under Quarterly review" icon={ListPlus} tone="lime" />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card title="Import report" subtitle="Analysed on the server with Gemini when GEMINI_API_KEY is set" className="xl:col-span-5">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) void upload(f); }}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-cyan-400/30 bg-cyan-400/[0.03] p-8 text-center transition hover:border-cyan-400/60 hover:bg-cyan-400/[0.06]"
          >
            {busy ? <Loader2 className="h-8 w-8 animate-spin text-cyan-300" /> : <Upload className="h-8 w-8 text-cyan-300 transition group-hover:-translate-y-0.5" />}
            <span className="text-sm font-medium">{busy ? 'Analysing report…' : 'Drop a PDF / image or click to upload'}</span>
            <span className="text-xs text-slate-500">PNG, JPEG, WebP or PDF · up to 10 MB</span>
          </button>
          <input ref={fileRef} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ''; }} />
          {notice && (
            <p className={cn('mt-3 flex items-start gap-2 rounded-xl px-3 py-2 text-xs', notice.tone === 'ok' ? 'bg-lime-400/10 text-lime-200' : 'bg-amber-400/10 text-amber-200')}>
              {notice.tone === 'ok' ? <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />}
              {notice.text}
            </p>
          )}

          <form onSubmit={addManual} className="mt-6 space-y-3 border-t border-white/10 pt-5">
            <p className="label">Manual entry</p>
            <div className="grid grid-cols-[1fr_110px_auto] gap-2">
              <select className="input" value={manual.name} onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))} aria-label="Biomarker">
                {Object.keys(REFERENCE).map((k) => <option key={k}>{k}</option>)}
              </select>
              <input className="input" type="number" step="any" min={0} placeholder={REFERENCE[manual.name]?.unit ?? ''} value={manual.value} onChange={(e) => setManual((m) => ({ ...m, value: e.target.value }))} aria-label="Value" />
              <button className="btn-ghost" type="submit"><Plus className="h-4 w-4" /> Save</button>
            </div>
          </form>
        </Card>

        <div className="xl:col-span-7">
          <Card title="Biomarker panel" subtitle={state.biomarkers.length ? 'Flagged results offer a one-click corrective task' : 'No results yet — import a report or enter values'}>
            <div className="grid gap-3 md:grid-cols-2">
              {state.biomarkers.map((b) => (
                <BiomarkerCard key={b.id} b={b} added={hasTask(b)} onSpawn={() => spawn(b)} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function correctiveTitle(b: Biomarker) {
  return `Corrective: ${b.name} (${b.value} ${b.unit})`;
}

function BiomarkerCard({ b, added, onSpawn }: { b: Biomarker; added: boolean; onSpawn: () => void }) {
  const { reason } = flagBiomarker(b.name, b.value);
  const scaleMax = b.refHigh ? b.refHigh * 1.5 : (b.refLow ?? 1) * 2;
  const pct = Math.min(100, (b.value / scaleMax) * 100);
  return (
    <div className={cn('rounded-xl border p-4 transition', b.flagged ? 'border-pink-400/30 bg-pink-500/[0.05]' : 'border-white/5 bg-white/[0.03]')}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{b.category}</p>
          <p className="text-sm font-semibold">{b.name}</p>
        </div>
        <span className={cn('rounded-full px-2 py-0.5 text-[10px]', b.flagged ? 'bg-pink-500/20 text-pink-200' : 'bg-lime-500/15 text-lime-200')}>{b.flagged ? 'Out of range' : 'In range'}</span>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums">{b.value}<span className="ml-1 text-xs font-normal text-slate-500">{b.unit}</span></p>
      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full', b.flagged ? 'bg-pink-400' : 'bg-cyan-400')} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-500">{reason}{b.refLow !== undefined || b.refHigh !== undefined ? ` · ref ${b.refLow ?? '—'}–${b.refHigh ?? '—'}` : ''}</p>
      {b.flagged && (
        <button disabled={added} onClick={onSpawn} className="btn-ghost mt-3 w-full justify-center !py-1.5 text-xs disabled:opacity-60">
          {added ? <><CheckCircle2 className="h-3.5 w-3.5 text-lime-300" /> Task added</> : <><ListPlus className="h-3.5 w-3.5" /> Add corrective task to Mind-Map</>}
        </button>
      )}
    </div>
  );
}
