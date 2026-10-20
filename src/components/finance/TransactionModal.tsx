import React, { useState } from 'react';
import { X, Plus, DollarSign } from 'lucide-react';
import { FinancialTransaction, BudgetBucket, TransactionType, CurrencyCode } from '@/types/finance';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: FinancialTransaction) => void;
  tasks?: Array<{ id: string; title: string }>;
}

export function TransactionModal({ isOpen, onClose, onSave, tasks = [] }: TransactionModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<TransactionType>('expense');
  const [bucket, setBucket] = useState<BudgetBucket>('needs');
  const [category, setCategory] = useState('Civil Materials');
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [linkedTaskId, setLinkedTaskId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;

    onSave({
      id: `tx_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: title.trim(),
      amount,
      type,
      bucket,
      category,
      currency,
      linkedTaskId: linkedTaskId || undefined,
      status: 'settled',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Record Financial Transaction</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-300 block mb-1">Title / Description</label>
            <input
              type="text"
              placeholder="e.g. Tor Steel advance payment"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Amount</label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
              >
                <option value="USD">USD ($)</option>
                <option value="LKR">LKR (Rs.)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TransactionType)}
                className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
              >
                <option value="expense">Expense (Outflow)</option>
                <option value="income">Income (Inflow)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">50/30/20 Bucket</label>
              <select
                value={bucket}
                onChange={(e) => setBucket(e.target.value as BudgetBucket)}
                className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
              >
                <option value="needs">Needs (50%)</option>
                <option value="wants">Wants (30%)</option>
                <option value="savings">Savings / Sinking (20%)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 block mb-1">Link to Mind-Map Task Node</label>
            <select
              value={linkedTaskId}
              onChange={(e) => setLinkedTaskId(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded-lg p-2 text-xs"
            >
              <option value="">None (General Ledger)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs"
            >
              Record Entry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
