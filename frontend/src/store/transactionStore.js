import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../utils/api';

const useTransactionStore = create((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  },

  fetchTransactions: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      set({ transactions: response.data, isLoading: false });
      get().calculateSummary();
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to fetch transactions',
        isLoading: false,
      });
    }
  },

  addTransaction: async (transactionData) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(
        `${API_URL}/transactions`,
        transactionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      set(state => ({
        transactions: [...state.transactions, response.data],
        isLoading: false,
      }));
      
      get().calculateSummary();
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to add transaction',
        isLoading: false,
      });
      return false;
    }
  },

  updateTransaction: async (id, transactionData) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(
        `${API_URL}/transactions/${id}`,
        transactionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      set(state => ({
        transactions: state.transactions.map(transaction => 
          transaction.id === id ? response.data : transaction
        ),
        isLoading: false,
      }));
      
      get().calculateSummary();
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to update transaction',
        isLoading: false,
      });
      return false;
    }
  },

  deleteTransaction: async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    set({ isLoading: true, error: null });
    try {
      await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      set(state => ({
        transactions: state.transactions.filter(transaction => transaction.id !== id),
        isLoading: false,
      }));
      
      get().calculateSummary();
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to delete transaction',
        isLoading: false,
      });
      return false;
    }
  },

  calculateSummary: () => {
    const { transactions } = get();
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
      
    set({
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
    });
  },

  clearError: () => set({ error: null }),
}));

export default useTransactionStore;