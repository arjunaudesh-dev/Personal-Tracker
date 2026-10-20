import React, { useState } from 'react';
import { DollarSign, ListTodo, Utensils, Plus, Check } from 'lucide-react';
import { TelemetryCharts } from './TelemetryCharts';

export function BriefingTelemetryColumn() {
  const [activeTab, setActiveTab] = useState<'expense' | 'task' | 'meal'>('expense');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [mealText, setMealText] = useState('');
  const [savedNotice, setSavedNotice] = useState('');

  const showSaved = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(''), 2500);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    showSaved(`Logged $${expenseAmount} to Ledger`);
    setExpenseTitle('');
    setExpenseAmount('');
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    showSaved(`Added task '${taskTitle}' to Mind-Map`);
    setTaskTitle('');
  };

  const handleMealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealText) return;
    showSaved(`AI estimated nutrition logged`);
    setMealText('');
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg space-y-4 flex flex-col h-full">
      {/* 3-Second Quick Capture */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-sky-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            3-Second Quick Capture
          </span>
          {savedNotice && (
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> {savedNotice}
            </span>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-1 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-all ${
              activeTab === 'expense' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> + Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex-1 py-1 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-all ${
              activeTab === 'task' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" /> + Sub-Task
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('meal')}
            className={`flex-1 py-1 text-xs font-semibold rounded flex items-center justify-center gap-1 transition-all ${
              activeTab === 'meal' ? 'bg-emerald-500 text-white font-bold' : 'text-slate-400'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> + Meal
          </button>
        </div>

        {/* Form body */}
        {activeTab === 'expense' && (
          <form onSubmit={handleExpenseSubmit} className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. Site concrete nails"
              value={expenseTitle}
              onChange={(e) => setExpenseTitle(e.target.value)}
              className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2.5 py-1.5 text-xs"
            />
            <input
              type="number"
              placeholder="$"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              className="w-16 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1.5 text-xs font-mono"
            />
            <button
              type="submit"
              className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded text-xs"
            >
              Add
            </button>
          </form>
        )}

        {activeTab === 'task' && (
          <form onSubmit={handleTaskSubmit} className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. Review mooring chain tension certificate"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2.5 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="bg-sky-500 text-white font-bold px-3 py-1.5 rounded text-xs"
            >
              Add
            </button>
          </form>
        )}

        {activeTab === 'meal' && (
          <form onSubmit={handleMealSubmit} className="flex gap-1.5">
            <input
              type="text"
              placeholder="e.g. 200g chicken breast with lentils and rice"
              value={mealText}
              onChange={(e) => setMealText(e.target.value)}
              className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2.5 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="bg-emerald-500 text-white font-bold px-3 py-1.5 rounded text-xs"
            >
              Log
            </button>
          </form>
        )}
      </div>

      {/* Recharts sparklines */}
      <TelemetryCharts />
    </div>
  );
}
