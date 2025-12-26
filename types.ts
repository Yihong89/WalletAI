
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  category: string;
  date: string;
}

export interface AIInsight {
  summary: string;
  suggestions: string[];
  spendingAnalysis: {
    category: string;
    percentage: number;
  }[];
}
