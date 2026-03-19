'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  description: string;
  isPublic: boolean;
}

export default function MyPublicAgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyAgents();
  }, []);

  const fetchMyAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Failed to fetch agents', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePublic = async (agent: Agent) => {
    try {
      if (agent.isPublic) {
        await axios.post(`/api/agents/${agent.id}/unpublish`);
      } else {
        await axios.post(`/api/agents/${agent.id}/publish`);
      }
      fetchMyAgents();
    } catch (error) {
      alert('Failed to update public status');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Public Agents</h1>
      {agents.length === 0 ? (
        <p className="text-gray-500">You haven't created any agents yet.</p>
      ) : (
        <div className="space-y-3">
          {agents.map(agent => (
            <div key={agent.id} className="border rounded-lg p-4 bg-white flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{agent.name}</h2>
                {agent.description && <p className="text-sm text-gray-600">{agent.description}</p>}
              </div>
              <button
                onClick={() => togglePublic(agent)}
                className={`px-3 py-1 rounded text-sm ${
                  agent.isPublic
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {agent.isPublic ? 'Public' : 'Private'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}