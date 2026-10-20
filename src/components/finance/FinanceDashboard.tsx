import React, { useState, useMemo } from 'react';
import { initialTransactions, mockWaterfallData } from './mock-finance-data';
import { FinanceKpiCards } from './FinanceKpiCards';
import { FinanceCharts } from './FinanceCharts';
import { AIFinancialAdvisor } from './AIFinancialAdvisor';
import { TransactionAndBudgetManager } from './TransactionAndBudgetManager';
import { TransactionModal } from './TransactionModal';
import { CurrencyCode, FinancialTransaction, FinanceKpis } from '@/types/finance';

export function FinanceDashboard() {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic KPI rollups
  const kpis: FinanceKpis = useMemo(() => {
    let income = 0;
    let spend = 0;
    let committed = 0;

    transactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else {
        spend += t.amount;
        if (t.linkedTaskId) committed += t.amount;
      }
    });

    const netCashflow = income - spend;
    const dailyBurnRate = spend / 30;
    const savingsAmount = transactions
      .filter((t) => t.bucket === 'savings' && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    const savingsRate = income > 0 ? (savingsAmount / income) * 100 : 0;

    return {
      monthlyIncome: income,
      monthlySpend: spend,
      netCashflow,
      dailyBurnRate,
      savingsRate,
      committedTaskSpend: committed,
      totalLiquidCapital: 14850,
    };
  }, [transactions]);

  // Donut 50/30/20 data
  const donutData = useMemo(() => {
    const expenses = transactions.filter((t) => t.type === 'expense');
    const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0) || 1;
    const needs = expenses.filter((t) => t.bucket === 'needs').reduce((acc, t) => acc + t.amount, 0);
    const wants = expenses.filter((t) => t.bucket === 'wants').reduce((acc, t) => acc + t.amount, 0);
    const savings = expenses.filter((t) => t.bucket === 'savings').reduce((acc, t) => acc + t.amount, 0);

    return [
      { name: 'Needs', value: Math.round((needs / totalExp) * 100), color: '#f59e0b', target: 50 },
      { name: 'Wants', value: Math.round((wants / totalExp) * 100), color: '#a855f7', target: 30 },
      { name: 'Savings / Sinking', value: Math.round((savings / totalExp) * 100), color: '#10b981', target: 20 },
    ];
  }, [transactions]);

  // Category planned vs actual
  const categoryData = useMemo(() => [
    { category: 'Civil Materials', planned: 2500, actual: 1800 },
    { category: 'Housing & Base', planned: 1300, actual: 1200 },
    { category: 'Athletic Nutrition', planned: 700, actual: 620 },
    { category: 'Tactical Gear', planned: 500, actual: 450 },
    { category: 'Transport Fuel', planned: 400, actual: 380 },
  ], []);

  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === 'USD' ? 'LKR' : 'USD'));
  };

  const handleAddTransaction = (newTx: FinancialTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <FinanceKpiCards
        kpis={kpis}
        currency={currency}
        onToggleCurrency={handleToggleCurrency}
      />

      <AIFinancialAdvisor kpis={kpis} />

      <FinanceCharts
        waterfallData={mockWaterfallData}
        donutData={donutData}
        categoryData={categoryData}
        currency={currency}
      />

      <TransactionAndBudgetManager
        transactions={transactions}
        currency={currency}
        onOpenModal={() => setIsModalOpen(true)}
        onDeleteTransaction={handleDeleteTransaction}
      />

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddTransaction}
        tasks={[
          { id: 'tree-admin-slab', title: 'Admin Building 1st Floor Slab' },
          { id: 'task-slab-rebar', title: 'Tor Steel Rebar Procurement' },
          { id: 'tree-floating-dock', title: 'Harbor Floating Dock Mooring' },
        ]}
      />
    </div>
  );
}
