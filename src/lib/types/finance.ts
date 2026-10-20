/**
 * NEXUS LIFE-OS — Financial & budget type contracts.
 */

export type Currency = 'USD' | 'LKR';
export type Bucket = 'needs' | 'wants' | 'savings';
export type TxType = 'income' | 'expense';
export type TxStatus = 'settled' | 'pending' | 'overdue';

export interface FinancialTransaction {
  id: string;
  date: string;
  amount: number;
  currency: Currency;
  title: string;
  category: string;
  bucket: Bucket;
  type: TxType;
  linkedTaskId: string | null;
  status: TxStatus;
  createdAt: string;
}

export interface BudgetPlan {
  bucket: Bucket;
  label: string;
  ratio: number;
  color: string;
  description: string;
}

export interface CategoryVariance {
  category: string;
  planned: number;
  actual: number;
  bucket: Bucket;
}

export interface CashflowPoint {
  period: string;
  inflow: number;
  outflow: number;
  net: number;
  balance: number;
}

export interface DailyOutflow {
  day: string;
  amount: number;
}

export interface AdvisorDirective {
  title: string;
  detail: string;
  impact: number;
  severity: 'low' | 'medium' | 'high';
}
