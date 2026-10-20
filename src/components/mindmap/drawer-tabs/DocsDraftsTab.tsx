import React from 'react';
import { FileText, Sparkles, Copy, Check } from 'lucide-react';
import { MindMapTaskNode } from '@/types/mindmap';

interface DocsDraftsTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function DocsDraftsTab({ task, onUpdate }: DocsDraftsTabProps) {
  const [copied, setCopied] = React.useState(false);

  const generateTemplate = (type: 'site_minute' | 'boq_memo' | 'nhq_submission') => {
    let draft = '';
    const now = new Date().toLocaleDateString();

    if (type === 'site_minute') {
      draft = `SITE WORK INSPECTION MINUTE\nDate: ${now}\nOfficer: Arjuna Kahandawa (Civil Engineer Officer)\nProject: ${task.title}\nStatus: ${task.status.toUpperCase()} (${task.progress}%)\n\n1. Observations on site formwork & steel tying.\n2. Safety perimeter verified.\n3. Slump test and cube sample requirements noted.`;
    } else if (type === 'boq_memo') {
      draft = `MEMORANDUM: BOQ DISBURSEMENT CLEARANCE\nRef: ENG/DISB/${task.id.slice(0, 6)}\nSubject: Material requisition for ${task.title}\nTotal Estimated: $${task.cashflow?.actualSpend || 0}\n\nRecommended for executive financial signoff.`;
    } else {
      draft = `NAVAL HEADQUARTERS FORMAL CONCURRENCE REQUEST\nTo: Director Civil Engineering, NHQ Colombo\nFrom: Civil Engineer Officer Arjuna Kahandawa\nProject: ${task.title}\n\nRequesting final engineering sanction and structural approval.`;
    }

    onUpdate({ markdownNotes: draft });
  };

  const copyNotes = () => {
    if (task.markdownNotes) {
      navigator.clipboard.writeText(task.markdownNotes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          AI Technical Document Templates
        </span>
        <button
          type="button"
          onClick={copyNotes}
          className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied' : 'Copy Text'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => generateTemplate('site_minute')}
          className="p-2 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-left transition-colors"
        >
          <div className="font-bold text-xs text-white">Site Minute</div>
          <div className="text-[10px] text-slate-400">Civil inspection memo</div>
        </button>

        <button
          type="button"
          onClick={() => generateTemplate('boq_memo')}
          className="p-2 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-left transition-colors"
        >
          <div className="font-bold text-xs text-white">BOQ Memo</div>
          <div className="text-[10px] text-slate-400">Finance clearance</div>
        </button>

        <button
          type="button"
          onClick={() => generateTemplate('nhq_submission')}
          className="p-2 rounded bg-slate-800/80 hover:bg-slate-700/80 border border-white/5 text-left transition-colors"
        >
          <div className="font-bold text-xs text-white">NHQ Letter</div>
          <div className="text-[10px] text-slate-400">Headquarters dispatch</div>
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-1">
          Technical Draft / Specifications Content
        </label>
        <textarea
          rows={8}
          value={task.markdownNotes || ''}
          onChange={(e) => onUpdate({ markdownNotes: e.target.value })}
          placeholder="Select an AI draft template above or write technical directives..."
          className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2.5 text-xs font-mono leading-relaxed"
        />
      </div>
    </div>
  );
}
