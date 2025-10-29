import { create } from 'zustand';
import api from '../api/axios';
import { toast } from 'react-toastify';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    try {
      const res = await api.get('/auth/check');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signup: async (data) => {
    try {
      const res = await api.post('/auth/signup', data);
      set({ user: res.data.user, isAuthenticated: true });
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return false;
    }
  },

  login: async (data) => {
    try {
      const res = await api.post('/auth/login', data);
      set({ user: res.data.user, isAuthenticated: true });
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  },

  logout: async () => {
    try {
      await api.get('/auth/logout');
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  },
}));

export default useAuthStore;