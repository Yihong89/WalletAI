
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionType } from './types';
import TransactionForm from './components/TransactionForm';
import Dashboard from './components/Dashboard';
import { getFinancialInsights } from './services/geminiService';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load transactions from storage", e);
      return [];
    }
  });

  const [aiInsight, setAiInsight] = useState<string>('Analyzing your financial data...');
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handle AI insights generation
  useEffect(() => {
    const updateInsights = async () => {
      if (transactions.length === 0) {
        setAiInsight('Add some transactions to see AI financial insights!');
        return;
      }
      setLoadingInsights(true);
      const insight = await getFinancialInsights(transactions);
      setAiInsight(insight);
      setLoadingInsights(false);
    };

    const timer = setTimeout(updateInsights, 2000); 
    return () => clearTimeout(timer);
  }, [transactions]);

  const stats = useMemo(() => {
    const balance = transactions.reduce((acc, t) => acc + (t.type === 'income' ? t.amount : -t.amount), 0);
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return { balance, income, expense };
  }, [transactions]);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: uuidv4(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear ALL history? This cannot be undone.')) {
      setTransactions([]);
      localStorage.removeItem('transactions');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header section */}
      <header className="bg-blue-600 text-white pt-10 pb-20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight">AI Smart Ledger</h1>
            <div className="flex gap-2">
              <div className="bg-blue-500/30 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                Local Storage Enabled
              </div>
              <button 
                onClick={handleClearAll}
                className="bg-red-500/20 hover:bg-red-500/40 transition-colors px-3 py-1 rounded-full text-sm backdrop-blur-sm border border-red-400/30"
              >
                Clear All Data
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <p className="text-blue-100 text-sm font-medium mb-1">Current Balance</p>
              <h2 className="text-4xl font-bold">S${stats.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <p className="text-green-200 text-sm font-medium mb-1">Total Income</p>
              <h2 className="text-3xl font-bold text-green-300">S${stats.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
              <p className="text-red-200 text-sm font-medium mb-1">Total Expenses</p>
              <h2 className="text-3xl font-bold text-red-300">S${stats.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form and AI Advisor */}
          <div className="lg:col-span-4 space-y-6">
            <TransactionForm onAdd={handleAddTransaction} />
            
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 className="font-bold text-lg">AI Financial Advisor</h3>
              </div>
              <div className="text-sm text-indigo-50 leading-relaxed min-h-[80px]">
                {loadingInsights ? (
                  <div className="flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-indigo-200 rounded-full"></div>
                    <span>Generating your personalized advice...</span>
                  </div>
                ) : (
                  <p>{aiInsight}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: List and Charts */}
          <div className="lg:col-span-8">
            <Dashboard transactions={transactions} />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">History</h3>
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {transactions.length} Transactions
                </span>
              </div>
              
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="mb-4 text-4xl">📭</div>
                    <p>No records found. What did you spend today?</p>
                  </div>
                ) : (
                  transactions.map((t) => (
                    <div key={t.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{t.description}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{t.category}</span>
                            <span>•</span>
                            <span>{new Date(t.date).toLocaleDateString('en-SG')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className={`font-bold text-lg ${
                          t.type === 'income' ? 'text-green-600' : 'text-slate-800'
                        }`}>
                          {t.type === 'income' ? '' : '-'}S${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
                          title="Delete record"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
