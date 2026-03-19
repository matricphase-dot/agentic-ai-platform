'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import Link from 'next/link';
import { UserIcon } from '@heroicons/react/24/outline';

interface Agent {
  id: string;
  name: string;
  description: string;
  owner: { name: string; email: string };
  createdAt: string;
}

export default function PublicAgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents/public');
      setAgents(res.data);
    } catch (error) {
      console.error('Failed to fetch public agents', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading public agents...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Public Agents</h1>
      {agents.length === 0 ? (
        <p className="text-gray-500">No public agents yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => (
            <div key={agent.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <h2 className="text-lg font-semibold">{agent.name}</h2>
              {agent.description && <p className="text-sm text-gray-600 mt-1">{agent.description}</p>}
              <div className="flex items-center mt-3 text-sm text-gray-500">
                <UserIcon className="w-4 h-4 mr-1" />
                <span>{agent.owner.name || agent.owner.email}</span>
              </div>
              <div className="mt-4">
                <Link
                  href={`/agents/${agent.id}`}
                  className="text-indigo-600 hover:underline text-sm"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}