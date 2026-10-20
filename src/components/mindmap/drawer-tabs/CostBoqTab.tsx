'use client';

import { Calculator, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { formatCurrency, uid } from '@/lib/parser/utils';

const BOQ_TEMPLATES = [
  'Labour — foreman & crew',
  'Material supply',
  'Plant / equipment hire',
  'Transport & logistics',
  'Testing & certification',
];

/** Tab 3 — itemized Bill of Quantities (Qty × Rate = Total). */
export function CostBoqTab({ task }: { task: MindMapTaskNode }) {
  const { state, dispatch } = useNexus();
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [rate, setRate] = useState('0');
  const [unit, setUnit] = useState('no');

  const cashflow = task.cashflow;
  const lines = cashflow?.boq ?? [];

  const lineTotal = (q: number, r: number) => Math.round(q * r * 100) / 100;

  const addLine = (template?: string) => {
    const label = (template ?? description).trim();
    if (!label) return;
    const q = Number(quantity) || 0;
    const r = Number(rate) || 0;
    const next = {
      ...(cashflow ?? {
        estimatedCost: 0,
        actualSpend: 0,
        committed: 0,
        currency: 'USD' as const,
        boq: [],
      }),
      boq: [
        ...lines,
        {
          id: uid('boq'),
          description: label,
          unit,
          quantity: q,
          rate: r,
          currency: state.currency,
        },
      ],
    };
    next.estimatedCost = Math.round(next.boq.reduce((a, l) => a + lineTotal(l.quantity, l.rate), 0));
    dispatch({ type: 'update-task', id: task.id, patch: { cashflow: next } });
    setDescription('');
    setQuantity('1');
    setRate('0');
  };

  const removeLine = (id: string) => {
    if (!cashflow) return;
    const nextBoq = lines.filter((l) => l.id !== id);
    const next = {
      ...cashflow,
      boq: nextBoq,
      estimatedCost: Math.round(nextBoq.reduce((a, l) => a + lineTotal(l.quantity, l.rate), 0)),
    };
    dispatch({ type: 'update-task', id: task.id, patch: { cashflow: next } });
  };

  const total = lines.reduce((a, l) => a + lineTotal(l.quantity, l.rate), 0);
  const actual = lines.reduce(
    (a, l) => a + lineTotal(l.actualQty ?? 0, l.actualRate ?? l.rate),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Estimated', value: cashflow?.estimatedCost ?? 0, tone: 'text-nexus-cyan' },
          { label: 'Actual spend', value: cashflow?.actualSpend ?? 0, tone: 'text-nexus-amber' },
          { label: 'Committed', value: cashflow?.committed ?? 0, tone: 'text-nexus-violet' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass-soft px-3 py-2">
            <p className="label-caps">{kpi.label}</p>
            <p className={`mt-1 font-mono text-sm font-semibold ${kpi.tone}`}>
              {formatCurrency(kpi.value, state.currency, { compact: true })}
            </p>
          </div>
        ))}
      </div>

      <section>
        <p className="label-caps mb-2">Itemised lines</p>
        {lines.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-slate-600">
            No BOQ lines yet. Use a template or add a line below.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-white/[0.07]">
            <table className="w-full text-left text-[10.5px]">
              <thead className="bg-white/[0.04] text-[9px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-2.5 py-2 font-semibold">Description</th>
                  <th className="px-2 py-2 font-semibold">Qty</th>
                  <th className="px-2 py-2 font-semibold">Rate</th>
                  <th className="px-2 py-2 text-right font-semibold">Total</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t border-white/[0.05]">
                    <td className="max-w-[160px] truncate px-2.5 py-1.5 text-slate-300">
                      {line.description}
                      <span className="ml-1 text-[9px] text-slate-600">({line.unit})</span>
                    </td>
                    <td className="px-2 py-1.5 font-mono text-slate-400">{line.quantity}</td>
                    <td className="px-2 py-1.5 font-mono text-slate-400">{line.rate}</td>
                    <td className="px-2 py-1.5 text-right font-mono text-nexus-cyan">
                      {formatCurrency(lineTotal(line.quantity, line.rate), state.currency, {
                        compact: true,
                      })}
                    </td>
                    <td className="pr-1.5 text-right">
                      <button
                        onClick={() => removeLine(line.id)}
                        className="text-slate-600 transition-colors hover:text-nexus-rose"
                        aria-label="Remove line"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-white/10 bg-white/[0.03]">
                  <td className="px-2.5 py-2 font-semibold text-slate-300" colSpan={3}>
                    Total BOQ
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-sm font-semibold text-nexus-cyan">
                    {formatCurrency(total, state.currency, { compact: true })}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="glass-soft p-3">
        <p className="label-caps mb-2">Add line</p>
        <div className="grid grid-cols-12 gap-1.5">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="input col-span-12 sm:col-span-6"
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unit"
            className="input col-span-4 sm:col-span-2"
          />
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Qty"
            className="input col-span-4 sm:col-span-2"
          />
          <input
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Rate"
            className="input col-span-4 sm:col-span-2"
          />
          <button onClick={() => addLine()} className="btn btn-primary col-span-12 sm:col-span-12">
            <Plus className="h-3 w-3" />
            Add BOQ line
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {BOQ_TEMPLATES.map((tpl) => (
            <button
              key={tpl}
              onClick={() => addLine(tpl)}
              className="chip transition-colors hover:border-nexus-cyan/40 hover:text-nexus-cyan"
            >
              <Calculator className="h-2.5 w-2.5" />
              {tpl}
            </button>
          ))}
        </div>
      </section>

      {actual > 0 ? (
        <p className="text-[10px] text-slate-500">
          Actual quantity consumption tracked to date:{' '}
          <span className="font-mono text-nexus-amber">
            {formatCurrency(actual, state.currency, { compact: true })}
          </span>
        </p>
      ) : null}
    </div>
  );
}
