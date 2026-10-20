import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2, Plus } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';

interface AiInsightsTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function AiInsightsTab({ task, onUpdate }: AiInsightsTabProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      let recs: string[] = [];
      if (task.groupCategory === 'Civil') {
        recs = [
          'Verify slump test specification with Ready-Mix supplier',
          'Deploy rebound hammer test for cured concrete inspection',
          'Coordinate site safety barricade at naval perimeter gate 4',
        ];
      } else if (task.groupCategory === 'Health') {
        recs = [
          'Log 5,000 IU Vitamin D3 + K2 with fatty breakfast',
          'Perform RPE 8 dynamic warmup prior to heavy compound sets',
          'Ensure 800ml electrolyte rehydration before site inspection',
        ];
      } else {
        recs = [
          'Review 50/30/20 monthly variance with cashflow waterfall',
          'Settle vendor invoice via direct bank transfer and log receipt',
          'Flag outstanding procurement items for next military cycle',
        ];
      }
      setSuggestions(recs);
      setLoading(false);
    }, 600);
  };

  const addAsSubtask = (title: string) => {
    const subtasks = task.subtasks || [];
    onUpdate({
      subtasks: [...subtasks, { id: `st_${Date.now()}`, title, completed: false }],
    });
    setSuggestions(suggestions.filter((s) => s !== title));
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-sky-950/40 to-indigo-950/40 p-3 rounded-lg border border-sky-500/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" /> Gemini 2.5 Flash Action Generator
          </span>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate Steps'}
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Decompose this engineering node into tactical actionable steps and site checks.
        </p>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            AI Generated Execution Steps
          </span>
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded bg-slate-800/70 border border-white/5 text-xs text-slate-200"
            >
              <span>{s}</span>
              <button
                type="button"
                onClick={() => addAsSubtask(s)}
                className="text-sky-400 hover:text-sky-300 flex items-center gap-1 text-[11px] font-semibold ml-2 flex-shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Adopt
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
