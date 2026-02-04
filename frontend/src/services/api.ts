// Update to use real backend endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Enhanced API service with proper error handling
export const apiService = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    },

    register: async (name: string, email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      return handleResponse(response);
    },

    getProfile: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    },
  },

  // Agents endpoints
  agents: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents`);
      return handleResponse(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${id}`);
      return handleResponse(response);
    },

    execute: async (id: string, input: string, token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents/${id}/execute`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      return handleResponse(response);
    },

    create: async (agentData: any, token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/agents`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentData),
      });
      return handleResponse(response);
    },
  },

  // Execution history
  history: {
    getAll: async (token: string) => {
      const response = await fetch(`${API_BASE_URL}/api/v1/history`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return handleResponse(response);
    },
  },
};

// Helper function for handling responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Request failed');
  }
  return response.json();
};