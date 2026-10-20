import React, { useState } from 'react';
import { Plus, Trash2, Calculator, DollarSign } from 'lucide-react';
import { MindMapTaskNode, BoqItem } from '@/types/mindmap';
import { formatCurrency } from '@/lib/utils';

interface CostBoqTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function CostBoqTab({ task, onUpdate }: CostBoqTabProps) {
  const cashflow = task.cashflow || {
    estimatedCost: 0,
    actualSpend: 0,
    currency: 'USD',
    items: [],
  };
  const items = cashflow.items || [];

  const [desc, setDesc] = useState('');
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState('units');
  const [rate, setRate] = useState<number>(0);
  const [category, setCategory] = useState<'Material' | 'Labor' | 'Equipment' | 'Subcontract'>('Material');

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || rate <= 0) return;
    const total = qty * rate;
    const newItem: BoqItem = {
      id: `boq_${Date.now()}`,
      description: desc.trim(),
      quantity: qty,
      unit,
      unitRate: rate,
      total,
      category,
    };
    const updatedItems = [...items, newItem];
    const newTotalSpend = updatedItems.reduce((acc, it) => acc + it.total, 0);

    onUpdate({
      cashflow: {
        ...cashflow,
        actualSpend: newTotalSpend,
        estimatedCost: Math.max(cashflow.estimatedCost, newTotalSpend),
        items: updatedItems,
      },
    });

    setDesc('');
    setRate(0);
    setQty(1);
  };

  const removeItem = (id: string) => {
    const updatedItems = items.filter((it) => it.id !== id);
    const newTotalSpend = updatedItems.reduce((acc, it) => acc + it.total, 0);
    onUpdate({
      cashflow: {
        ...cashflow,
        actualSpend: newTotalSpend,
        items: updatedItems,
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* BOQ Summary Card */}
      <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-amber-500/20">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-mono">Total BOQ Value</span>
          <div className="text-lg font-bold text-amber-400 font-mono">
            {formatCurrency(cashflow.actualSpend, cashflow.currency)}
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-mono">Line Items</span>
          <div className="text-lg font-bold text-white font-mono">{items.length}</div>
        </div>
      </div>

      {/* BOQ Table */}
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 font-mono uppercase text-[10px]">
            <tr>
              <th className="p-2">Item Description</th>
              <th className="p-2 text-center">Qty / Unit</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Total</th>
              <th className="p-2 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-slate-900/30">
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-white/5">
                <td className="p-2 text-slate-200">
                  <div className="font-semibold">{it.description}</div>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                    {it.category}
                  </span>
                </td>
                <td className="p-2 text-center text-slate-300 font-mono">
                  {it.quantity} {it.unit}
                </td>
                <td className="p-2 text-right text-slate-300 font-mono">
                  ${it.unitRate.toFixed(2)}
                </td>
                <td className="p-2 text-right font-bold text-amber-400 font-mono">
                  ${it.total.toFixed(2)}
                </td>
                <td className="p-2 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(it.id)}
                    className="text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-slate-500 text-xs">
                  No BOQ items added. Add itemized quantities below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add BOQ Form */}
      <form onSubmit={addItem} className="bg-slate-850 p-3 rounded-lg border border-white/5 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5 text-amber-400" /> + Add Itemized BOQ Spec
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="e.g. Tor Steel T16 (ton)"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="col-span-2 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
          <div className="flex gap-1">
            <input
              type="number"
              step="any"
              placeholder="Qty"
              value={qty || ''}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-1/2 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
            />
            <input
              type="text"
              placeholder="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-1/2 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
            />
          </div>
          <div className="flex gap-1">
            <input
              type="number"
              step="any"
              placeholder="Unit Rate ($)"
              value={rate || ''}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-1/2 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-1/2 bg-slate-800 text-slate-200 border border-white/10 rounded px-1 text-xs"
            >
              <option value="Material">Material</option>
              <option value="Labor">Labor</option>
              <option value="Equipment">Equipment</option>
              <option value="Subcontract">Subcontract</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded text-xs mt-1"
        >
          Append to BOQ Ledger
        </button>
      </form>
    </div>
  );
}
