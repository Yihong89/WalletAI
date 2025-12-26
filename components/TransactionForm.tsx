
import React, { useState } from 'react';
import { TransactionType } from '../types';
import { categorizeTransaction } from '../services/geminiService';

interface TransactionFormProps {
  onAdd: (transaction: {
    amount: number;
    description: string;
    type: TransactionType;
    category: string;
    date: string;
  }) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    const category = await categorizeTransaction(description, type);
    
    onAdd({
      amount: parseFloat(amount),
      description,
      type,
      category,
      date: new Date().toISOString(),
    });

    setAmount('');
    setDescription('');
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold mb-4 text-slate-800">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              type === 'expense' 
                ? 'bg-white text-red-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              type === 'income' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Income
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Starbucks Coffee"
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Amount (S$)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            step="0.01"
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98]'
          }`}
        >
          {loading ? 'AI Analyzing...' : 'Record Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
