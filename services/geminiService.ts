
import { GoogleGenAI } from "@google/genai";
import { Transaction, TransactionType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const categorizeTransaction = async (description: string, type: TransactionType): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize this ${type} transaction description into a single short English word (e.g., Food, Transport, Salary, Rent, Shopping, Entertainment, Healthcare, Bills): "${description}". Return only the category name.`,
      config: {
        maxOutputTokens: 20,
        temperature: 0.1,
      },
    });
    const text = response.text || "";
    return text.trim().replace(/[^\w\s]/gi, '') || (type === 'income' ? 'Income' : 'General');
  } catch (error) {
    console.error("Failed to categorize:", error);
    return type === 'income' ? 'Income' : 'General';
  }
};

export const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
  if (transactions.length === 0) return "Add some transactions to see AI financial insights!";

  const historyStr = transactions
    .slice(-20)
    .map(t => `${t.date}: ${t.type === 'income' ? '+' : '-'}${t.amount} (${t.description} - ${t.category})`)
    .join("\n");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Act as a professional financial advisor. Analyze the following recent transaction history and provide a concise summary (max 3 sentences) of spending habits and one specific tip for saving money. Answer in English.
      History:
      ${historyStr}`,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Failed to get insights:", error);
    return "Unable to generate insights at the moment.";
  }
};
