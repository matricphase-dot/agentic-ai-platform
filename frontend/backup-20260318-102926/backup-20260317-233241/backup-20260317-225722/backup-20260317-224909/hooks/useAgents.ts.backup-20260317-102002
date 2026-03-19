import { useState, useEffect } from 'react';

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'idle' | 'error' | 'maintenance';
  type: string;
  tasks: number;
  lastActive: string;
}

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents');
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.data);
      } else {
        setError(data.error || 'Failed to fetch agents');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createAgent = async (agentData: Omit<Agent, 'id' | 'lastActive'>) => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAgents(prev => [...prev, data.data]);
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: fetchAgents,
    createAgent,
  };
}
