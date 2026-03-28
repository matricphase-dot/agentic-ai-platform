'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  description: string;
  agentType: string;
  status: string;
  configuration: any;
}

export default function AgentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await api.get(`/agents/${id}`);
        setAgent(res.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch agent');
      } finally {
        setLoading(false);
      }
    };
    fetchAgent();
  }, [id]);

  if (loading) return <div>Loading agent...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!agent) return <div>Agent not found.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{agent.name}</h1>
        {/* Chat button removed */}
      </div>
      <p className="text-gray-600 mb-4">{agent.description}</p>
      <div className="bg-white p-4 rounded shadow">
        <p><strong>Type:</strong> {agent.agentType}</p>
        <p><strong>Status:</strong> {agent.status}</p>
        {agent.configuration && (
          <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
            {JSON.stringify(agent.configuration, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
