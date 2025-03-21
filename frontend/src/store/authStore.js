import { create } from 'zustand';
import axios from 'axios';
import { API_URL } from '../utils/api';

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { access_token, user } = response.data;
      
      // Store token and user in localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({
        token: access_token,
        user,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to login',
        isLoading: false,
      });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error.response?.data?.detail || 'Failed to sign up',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;