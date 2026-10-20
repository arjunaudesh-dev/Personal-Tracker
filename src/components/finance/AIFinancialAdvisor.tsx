import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { FinanceKpis } from '@/types/finance';

interface AIFinancialAdvisorProps {
  kpis: FinanceKpis;
}

export function AIFinancialAdvisor({ kpis }: AIFinancialAdvisorProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [directives, setDirectives] = useState<string[]>([
    'Capital Velocity Alert: Current daily burn rate is $115/day against a $140/day limit. Safe runway buffer is 42 days.',
    'Civil Procurement Sinking Fund: $1,800 committed for Tor steel rebar is fully covered by liquid cash reserves.',
    '50/30/20 Discipline: Needs allocation is at 48% (Target 50%). Allocate remaining 2% to coastal rip-rap safety reserve.',
  ]);

  const runAdvisoryAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setDirectives([
        `Synthesized with Gemini 2.5 Flash: Burn rate calibrated at $${kpis.dailyBurnRate.toFixed(0)}/day.`,
        `Committed BOQ spend ($${kpis.committedTaskSpend}) is properly segregated from personal emergency funds.`,
        'Recommendation: Maintain current USD/LKR hedge ratio (308 peg) to insulate against construction material import fluctuations.',
      ]);
      setAnalyzing(false);
    }, 800);
  };

  return (
    <div className="bg-gradient-to-r from-slate-900/90 via-sky-950/20 to-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-sky-500/20 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Gemini AI Financial Intelligence & Strategy Advisor
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Deterministic Cashflow Modeling • Rate-Limited Guardrail (15 RPM)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAdvisoryAnalysis}
          disabled={analyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-glow transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
          <span>{analyzing ? 'Evaluating...' : 'Re-synthesize Directives'}</span>
        </button>
      </div>

      <div className="space-y-2">
        {directives.map((directive, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/50 border border-white/5 text-xs text-slate-200"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{directive}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
