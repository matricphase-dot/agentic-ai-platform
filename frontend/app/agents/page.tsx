'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await api.get('/agents');
        setAgents(res.data);
      } catch (error) {
        console.error('Failed to fetch agents', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading agents...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Agents</h1>
        <Link href="/agents/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create Agent
        </Link>
      </div>
      {agents.length === 0 ? (
        <p>No agents yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{agent.name}</h2>
              <p className="text-gray-600 mt-1">{agent.description}</p>
              <Link href={`/agents/${agent.id}`} className="text-blue-500 mt-2 inline-block">
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
