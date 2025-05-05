// frontend/src/store/transactionStore.js
import { create } from 'zustand';
import api from '@/utils/api'; // Use the configured api instance

// Create stable action objects outside the store
const storeActions = {
  calculateSummary: (transactions) => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
};

const useTransactionStore = create((set, get) => {
  // Define all async functions with stable references
  const fetchAnalyticsData = async (timeframe = 'month') => {
    const currentState = get();
    // Avoid duplicate fetches
    if (currentState.isLoadingAnalytics) return;
    
    set({ isLoadingAnalytics: true, errorAnalytics: null });
    try {
      const response = await api.get(`/analytics`, { params: { timeframe } });
      set({ 
        analyticsData: response.data, 
        isLoadingAnalytics: false 
      });
    } catch (error) {
      console.error("Fetch Analytics Error:", error);
      set({
        errorAnalytics: error.response?.data?.detail || 'Failed to fetch analytics data',
        isLoadingAnalytics: false,
        analyticsData: null,
      });
    }
  };

  return {
    // State
    transactions: [],
    isLoading: false,
    error: null,
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
    },
    analyticsData: null,
    isLoadingAnalytics: false,
    errorAnalytics: null,

    // Actions with stable references
    calculateSummary: () => {
      const summary = storeActions.calculateSummary(get().transactions);
      set({ summary });
    },

    fetchTransactions: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.get(`/transactions`);
        set({ transactions: response.data, isLoading: false });
        get().calculateSummary();
      } catch (error) {
        console.error("Fetch Transactions Error:", error);
        set({
          error: error.response?.data?.detail || 'Failed to fetch transactions',
          isLoading: false,
        });
      }
    },

    // Use the pre-defined stable function
    fetchAnalyticsData,

    addTransaction: async (transactionData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.post(`/transactions`, transactionData);
        set(state => ({
          transactions: [response.data, ...state.transactions],
          isLoading: false,
        }));
        get().calculateSummary();
        return true;
      } catch (error) {
        console.error("Add Transaction Error:", error);
        set({
          error: error.response?.data?.detail || 'Failed to add transaction',
          isLoading: false,
        });
        return false;
      }
    },

    updateTransaction: async (id, transactionData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await api.put(`/transactions/${id}`, transactionData);
        set(state => ({
          transactions: state.transactions.map(transaction =>
            transaction.id === id ? response.data : transaction
          ),
          isLoading: false,
        }));
        get().calculateSummary();
        return true;
      } catch (error) {
        console.error("Update Transaction Error:", error);
        set({
          error: error.response?.data?.detail || 'Failed to update transaction',
          isLoading: false,
        });
        return false;
      }
    },

    deleteTransaction: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await api.delete(`/transactions/${id}`);
        set(state => ({
          transactions: state.transactions.filter(transaction => transaction.id !== id),
          isLoading: false,
        }));
        get().calculateSummary();
        return true;
      } catch (error) {
        console.error("Delete Transaction Error:", error);
        set({
          error: error.response?.data?.detail || 'Failed to delete transaction',
          isLoading: false,
        });
        return false;
      }
    },

    clearError: () => set({ error: null, errorAnalytics: null }),
  };
});

export default useTransactionStore;