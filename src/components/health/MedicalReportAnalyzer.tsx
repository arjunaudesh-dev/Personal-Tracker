import React, { useState } from 'react';
import { FileSearch, Sparkles, Upload, AlertCircle, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { ClinicalBloodworkReport, Biomarker } from '@/types/health';
import { initialBloodwork } from './mock-health-data';

interface MedicalReportAnalyzerProps {
  onSpawnTask?: (task: { title: string; category: string; priority: string; notes: string }) => void;
}

export function MedicalReportAnalyzer({ onSpawnTask }: MedicalReportAnalyzerProps) {
  const [report, setReport] = useState<ClinicalBloodworkReport>(initialBloodwork);
  const [analyzing, setAnalyzing] = useState(false);
  const [spawnedIds, setSpawnedIds] = useState<Set<string>>(new Set(['b12']));

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzing(true);
    setTimeout(() => {
      setReport(initialBloodwork);
      setAnalyzing(false);
    }, 1000);
  };

  const handleSpawnTask = (bio: Biomarker) => {
    setSpawnedIds((prev) => {
      const next = new Set(prev);
      next.add(bio.id);
      return next;
    });
    onSpawnTask?.({
      title: `Clinical Protocol: ${bio.name} (${bio.value} ${bio.unit})`,
      category: 'Health',
      priority: bio.status === 'critical' ? 'urgent' : 'high',
      notes: bio.correctiveAction || `Corrective biomarker action for ${bio.name}`,
    });
  };

  const categoryOrder = ['Lipid', 'Glycemic', 'Organ', 'Micronutrient', 'Hormone'] as const;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-rose-400" />
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Multimodal Clinical Lab & Bloodwork Analyzer
            </h3>
            <p className="text-[11px] text-slate-400">
              Lab: {report.labName} • Parsed with Gemini 2.5 Vision Pipeline
            </p>
          </div>
        </div>

        <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-white/10 transition-colors">
          <Upload className="w-3.5 h-3.5 text-sky-400" />
          <span>{analyzing ? 'Extracting Biomarkers...' : 'Upload New Lab PDF'}</span>
          <input type="file" accept=".pdf,image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* AI Clinical Interpretation */}
      <div className="bg-slate-950/60 p-3 rounded-lg border border-rose-500/20 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-rose-300 font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Clinical Diagnostic Synthesis
        </div>
        <p className="text-slate-300 leading-relaxed">{report.aiClinicalInterpretation}</p>
      </div>

      {/* Structured Biomarkers Grid */}
      <div className="space-y-3">
        {categoryOrder.map((cat) => {
          const catBios = report.biomarkers.filter((b) => b.category === cat);
          if (catBios.length === 0) return null;

          return (
            <div key={cat} className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                {cat} Assessment Panel
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {catBios.map((bio) => {
                  const isActionable = bio.status === 'borderline' || bio.status === 'critical';
                  const isSpawned = spawnedIds.has(bio.id);

                  return (
                    <div
                      key={bio.id}
                      className={`p-2.5 rounded-lg border text-xs flex flex-col justify-between transition-all ${
                        bio.status === 'critical'
                          ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                          : bio.status === 'borderline'
                          ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950/40 border-white/5 text-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-white">{bio.name}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase font-bold ${
                          bio.status === 'critical' ? 'bg-rose-500/20 text-rose-300' :
                          bio.status === 'borderline' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {bio.status}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1 my-1">
                        <span className="text-base font-bold font-mono text-white">{bio.value}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{bio.unit}</span>
                        <span className="text-[10px] text-slate-500 ml-auto">Ref: {bio.referenceRange}</span>
                      </div>

                      {bio.correctiveAction && (
                        <div className="text-[10px] text-slate-400 border-t border-white/5 pt-1 mt-1">
                          Action: {bio.correctiveAction}
                        </div>
                      )}

                      {isActionable && (
                        <button
                          type="button"
                          onClick={() => handleSpawnTask(bio)}
                          disabled={isSpawned}
                          className={`mt-2 py-1 px-2 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                            isSpawned
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-600 hover:bg-rose-500 text-white shadow'
                          }`}
                        >
                          {isSpawned ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Synced to Mind-Map
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" /> Add Corrective Task to Mind-Map
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
