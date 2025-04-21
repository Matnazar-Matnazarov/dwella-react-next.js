import { create } from 'zustand';
import { getCookie, deleteCookie } from 'cookies-next';
import axiosClient from '../api/client';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'CLIENT' | 'MASTER' | 'ADMIN' | string;
  is_active: boolean;
  picture?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  checkAuth: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user: User) => set({ 
    user,
    isAuthenticated: true,
    isLoading: false,
    error: null
  }),

  clearUser: () => set({ 
    user: null,
    isAuthenticated: false,
    isLoading: false
  }),

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if token exists
      const token = getCookie('access_token');
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return false;
      }
      
      // Get user info from backend
      const response = await axiosClient.get('/accounts/user/');
      set({ 
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to authenticate'
      });
      
      return false;
    }
  },

  logout: async () => {
    try {
      // Call logout endpoint
      await axiosClient.post('/api/logout/');
      
      // Clear cookies
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      
      // Clear user state
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Still clear user data even if API call fails
      deleteCookie('access_token');
      deleteCookie('refresh_token');
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  }
})); 