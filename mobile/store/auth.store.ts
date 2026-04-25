import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../lib/api';
import { storage } from '../lib/storage';

interface AuthState {
  user: any | null;
  token: string | null;
  walletAddress: string | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  setToken: (token: string | null) => Promise<void>;
  setWalletAddress: (address: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  walletAddress: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setToken: async (token) => {
    if (token) {
      await SecureStore.setItemAsync('jwt_token', token);
    } else {
      await SecureStore.deleteItemAsync('jwt_token');
    }
    set({ token });
  },
  setWalletAddress: async (address) => {
    await storage.set('wallet_address', address);
    set({ walletAddress: address });
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response: any = await api.auth.login(email, password);
      if (response.success) {
        const { token, user } = response.data;
        await SecureStore.setItemAsync('jwt_token', token);
        set({ token, user, isLoading: false });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('jwt_token');
    set({ user: null, token: null });
  },
  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('jwt_token');
      const walletAddress = await storage.get('wallet_address');
      set({ token, walletAddress });
      
      if (token) {
        const response: any = await api.auth.me();
        if (response.success) {
          set({ user: response.data });
        } else {
          await SecureStore.deleteItemAsync('jwt_token');
          set({ token: null, user: null });
        }
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));
