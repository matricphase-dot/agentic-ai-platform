import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { CONFIG } from './config';
import { router } from 'expo-router';

const client = axios.create({ 
  baseURL: CONFIG.API_URL, 
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('jwt_token');
      // Only redirect if we're not already on the login screen
      router.replace('/(auth)/login');
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (email: string, password: string) =>
      client.post('/api/auth/login', { email, password }),
    signup: (data: any) =>
      client.post('/api/auth/signup', data),
    me: () => client.get('/api/auth/me'),
    logout: () => client.post('/api/auth/logout'),
  },
  marketplace: {
    list: (params?: any) =>
      client.get('/api/marketplace', { params }),
    get: (id: string) =>
      client.get(`/api/marketplace/${id}`),
    review: (id: string, data: any) =>
      client.post(`/api/marketplace/${id}/review`, data),
  },
  staking: {
    positions: () => client.get('/api/staking/positions'),
    rewards: () => client.get('/api/staking/rewards'),
    stake: (agentId: string, amount: number) =>
      client.post('/api/staking/stake', { agentId, amount }),
    unstake: (stakeId: string) =>
      client.post('/api/staking/unstake', { stakeId }),
    claim: () => client.post('/api/staking/claim'),
  },
  governance: {
    proposals: (params?: any) =>
      client.get('/api/governance/proposals', { params }),
    proposal: (id: string) =>
      client.get(`/api/governance/proposals/${id}`),
    vote: (id: string, choice: string) =>
      client.post(`/api/governance/proposals/${id}/vote`, { choice }),
  },
  billing: {
    balance: () => client.get('/api/billing/balance'),
  },
  agents: {
    list: () => client.get('/api/agents'),
    get: (id: string) => client.get(`/api/agents/${id}`),
    chat: (agentId: string, message: string) => 
      client.post(`/api/agents/${agentId}/chat`, { message }),
  },
  notifications: {
    list: () => client.get('/api/notifications'),
    markRead: (id: string) =>
      client.put(`/api/notifications/${id}/read`),
    registerPushToken: (token: string, platform: string) =>
      client.post('/api/notifications/push-token', { token, platform }),
  },
  invoke: {
    run: (agentId: string, input: any) =>
      client.post(`/api/invoke/${agentId}`, input),
  }
};
