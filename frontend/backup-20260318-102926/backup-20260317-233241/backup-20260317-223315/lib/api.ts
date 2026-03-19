import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ========== AUTH ==========
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name?: string) => 
    api.post('/auth/register', { email, password, name }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// ========== AGENTS ==========
export const agentsApi = {
  getAll: () => api.get('/agents'),
  create: (data: any) => api.post('/agents', data),
  update: (id: string, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  assignTask: (agentId: string, taskType: string, parameters: any) =>
    api.post(`/agents/${agentId}/task`, { taskType, parameters }),
};

// ========== MARKETPLACE ==========
export const marketplaceApi = {
  getAgents: (params?: any) => api.get('/marketplace/agents', { params }),
  hireAgent: (agentId: string, businessId: string, terms?: any) =>
    api.post(`/marketplace/agents/${agentId}/hire`, { businessId, terms }),
  stakeOnAgent: (agentId: string, amount: number) =>
    api.post(`/marketplace/agents/${agentId}/stake`, { amount }),
};

// ========== BUSINESS ==========
export const businessApi = {
  getAll: () => api.get('/business'),
  create: (data: any) => api.post('/business', data),
  launch: (idea: string, industry: string) =>
    api.post('/business/launch', { idea, industry }),
  recordRevenue: (businessId: string, amount: number, source?: string) =>
    api.post(`/business/${businessId}/revenue`, { amount, source }),
};

// ========== HEALTH ==========
export const healthApi = {
  check: () => api.get('/health'),
};


// Debug: log all requests
api.interceptors.request.use((config) => {
  console.log(`ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã¢â‚¬â„¢Ãƒâ€šÃ‚Â ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});
// Request logging
api.interceptors.request.use((config) => {
  console.log(`ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Âµ ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});
// Log all API requests
api.interceptors.request.use((config) => {
  console.log(`Ã°Å¸â€Âµ ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});
// Agent creation
export const createAgent = (data) => api.post('/agents', data);

