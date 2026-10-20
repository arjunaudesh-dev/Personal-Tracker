export type BudgetBucket = 'needs' | 'wants' | 'savings';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'settled' | 'pending' | 'projected';
export type CurrencyCode = 'USD' | 'LKR';

export interface FinancialTransaction {
  id: string;
  userId?: string;
  date: string;
  amount: number;
  currency: CurrencyCode;
  title: string;
  category: string;
  bucket: BudgetBucket;
  type: TransactionType;
  linkedTaskId?: string;
  status: TransactionStatus;
  notes?: string;
}

export interface BudgetRule503020 {
  needsTarget: number;
  wantsTarget: number;
  savingsTarget: number;
  actualNeeds: number;
  actualWants: number;
  actualSavings: number;
  needsPercentage: number;
  wantsPercentage: number;
  savingsPercentage: number;
}

export interface CashflowWaterfallPoint {
  period: string;
  inflow: number;
  outflow: number;
  net: number;
  runningBalance: number;
}

export interface FinanceKpis {
  monthlyIncome: number;
  monthlySpend: number;
  netCashflow: number;
  dailyBurnRate: number;
  savingsRate: number;
  committedTaskSpend: number;
  totalLiquidCapital: number;
}
