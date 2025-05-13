import { create } from 'zustand';
import api from '@/utils/api';

const useBudgetStore = create((set, get) => ({
  budgets: [],
  isLoading: false,
  error: null,
  
  fetchBudgets: async (activeOnly = false, period = null) => {
    set({ isLoading: true, error: null });
    try {
      const params = {};
      if (activeOnly) params.active_only = true;
      if (period) params.period = period;

      const response = await api.get('/budgets', { params });
      set({ budgets: response.data, isLoading: false });
    } catch (error) {
      console.error("Fetch Budgets Error:", error);
      set({
        error: error.response?.data?.detail || 'Failed to fetch budgets',
        isLoading: false,
        budgets: []
      });
    }
  },

  addBudget: async (budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/budgets', budgetData);
      set(state => ({
        budgets: [response.data, ...state.budgets].sort((a, b) => new Date(b.start_date) - new Date(a.start_date)), // Keep sorted
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Add Budget Error:", error);
      set({
        error: error.response?.data?.detail || 'Failed to add budget',
        isLoading: false,
      });
      return false;
    }
  },

  updateBudget: async (id, budgetData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(`/budgets/${id}`, budgetData);
      set(state => ({
        budgets: state.budgets.map(budget =>
          budget.id === id ? { ...budget, ...response.data } : budget // Preserve progress data if not returned by PUT
        ),
        isLoading: false,
      }));
       // Optionally, refetch the specific budget with progress or all budgets
      get().fetchBudgets(); // Or a more targeted update
      return true;
    } catch (error) {
      console.error("Update Budget Error:", error);
      set({
        error: error.response?.data?.detail || 'Failed to update budget',
        isLoading: false,
      });
      return false;
    }
  },

  deleteBudget: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/budgets/${id}`);
      set(state => ({
        budgets: state.budgets.filter(budget => budget.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error("Delete Budget Error:", error);
      set({
        error: error.response?.data?.detail || 'Failed to delete budget',
        isLoading: false,
      });
      return false;
    }
  },
  
  clearError: () => set({ error: null }),
}));

export default useBudgetStore;