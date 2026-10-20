'use client';

import { FileText, LayoutTemplate, NotebookPen, Sparkles } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';

const DRAFT_TEMPLATES = [
  {
    id: 'minute',
    label: 'Site meeting minute',
    body: '### Site meeting minute\n- Date: \n- Attendees: \n- Decisions: \n- Actions raised: \n- Risks: ',
  },
  {
    id: 'method',
    label: 'Method statement',
    body: '### Method statement\n- Scope of works: \n- Sequence: \n- Resources: \n- Hold points: \n- Safety controls: ',
  },
  {
    id: 'boq',
    label: 'BOQ draft',
    body: '### Bill of quantities\n| Description | Unit | Qty | Rate | Total |\n| --- | --- | --- | --- | --- |\n|  |  |  |  |  |',
  },
  {
    id: 'inspection',
    label: 'Inspection request',
    body: '### Inspection request\n- Element: \n- Inspection type: \n- Requested date: \n- Hold point reference: ',
  },
];

/** Tab 2 — notes, AI minutes and BOQ templates. */
export function DocsDraftsTab({ task }: { task: MindMapTaskNode }) {
  const { dispatch } = useNexus();
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const applyTemplate = (id: string) => {
    const tpl = DRAFT_TEMPLATES.find((t) => t.id === id);
    if (!tpl) return;
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: { markdownNotes: `${task.markdownNotes}\n\n${tpl.body}` },
    });
    setActiveTemplate(id);
    window.setTimeout(() => setActiveTemplate(null), 1400);
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="label-caps mb-2">Working notes (Markdown)</p>
        <textarea
          value={task.markdownNotes}
          onChange={(e) =>
            dispatch({ type: 'update-task', id: task.id, patch: { markdownNotes: e.target.value } })
          }
          rows={8}
          className="input resize-y font-mono text-[11px] leading-relaxed"
          placeholder="Working notes…"
        />
      </section>

      <section>
        <p className="label-caps mb-2">Draft templates</p>
        <div className="grid grid-cols-2 gap-1.5">
          {DRAFT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.id)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-left transition-colors hover:border-nexus-cyan/35 hover:bg-white/[0.05]"
            >
              <LayoutTemplate className="h-3.5 w-3.5 shrink-0 text-nexus-cyan" />
              <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">{tpl.label}</span>
              {activeTemplate === tpl.id ? (
                <Sparkles className="h-3 w-3 animate-pulse text-nexus-emerald" />
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
        <div className="flex items-center gap-1.5">
          <NotebookPen className="h-3.5 w-3.5 text-nexus-violet" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-violet">
            AI minute generator
          </p>
        </div>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-slate-500">
          Produces a structured minute, method statement or BOQ skeleton pre-filled with the task
          title, group category and linked BOQ lines.
        </p>
        <button
          onClick={() =>
            applyTemplate(task.cashflow?.boq.length ? 'boq' : 'minute')
          }
          className="btn btn-violet mt-2 h-7 px-2.5 text-[10px]"
        >
          <Sparkles className="h-3 w-3" />
          Generate draft
        </button>
      </section>

      <section>
        <p className="label-caps mb-2">Attached documents ({task.attachments.length})</p>
        {task.attachments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-slate-600">
            No documents attached.
          </p>
        ) : (
          <ul className="space-y-1">
            {task.attachments.map((file) => (
              <li
                key={file}
                className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2"
              >
                <FileText className="h-3.5 w-3.5 text-nexus-sky" />
                <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">{file}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
