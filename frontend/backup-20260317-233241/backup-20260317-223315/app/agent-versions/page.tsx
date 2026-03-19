'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { ClockIcon } from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  description: string;
  versionCount?: number;
}

export default function AgentVersionsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Failed to fetch agents', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Agent Version History</h1>
      <p className="text-gray-600 mb-6">Select an agent to view its version history.</p>
      {agents.length === 0 ? (
        <p className="text-gray-500">You have no agents yet.</p>
      ) : (
        <div className="grid gap-4">
          {agents.map(agent => (
            <Link
              key={agent.id}
              href={`/agents/versions/${agent.id}`}
              className="block p-4 border rounded-lg hover:shadow-md transition bg-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{agent.name}</h2>
                  {agent.description && <p className="text-sm text-gray-600">{agent.description}</p>}
                </div>
                <ClockIcon className="w-5 h-5 text-indigo-500" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}