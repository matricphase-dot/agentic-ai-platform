'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AgentsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchAgents();
  }, [isAuthenticated, token]);

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:8000/agents', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAgent = async (id) => {
    if (!confirm('Are you sure you want to delete this agent?')) return;

    try {
      await fetch(`http://localhost:8000/agents/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchAgents(); // Refresh list
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Agents</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI agents and their capabilities
          </p>
        </div>
        <Link
          href="/dashboard/agents/create"
          className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white transition hover:from-blue-700 hover:to-purple-700"
        >
          + Create New Agent
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search agents by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <div className="absolute left-4 top-3.5">??</div>
        </div>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl dark:bg-gray-800"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                      <span className="text-white">??</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{agent.name}</h3>
                      <span className="mt-1 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {agent.role || 'AI Agent'}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="text-gray-500 hover:text-gray-700">
                      ?
                    </button>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                  {agent.description || 'No description provided'}
                </p>

                <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">??</span>
                    <span>
                      Updated {new Date(agent.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">??</span>
                    <span>${agent.cost_per_query || '0.00'}/query</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/agents/${agent.id}`}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-white transition hover:bg-blue-700"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => deleteAgent(agent.id)}
                    className="rounded-lg border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">??</div>
          <h3 className="mb-2 text-xl font-bold">No AI Agents Found</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'Try a different search term'
              : 'Create your first AI agent to get started'}
          </p>
          <Link
            href="/dashboard/agents/create"
            className="inline-block rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-medium text-white transition hover:from-blue-700 hover:to-purple-700"
          >
            Create Your First Agent
          </Link>
        </div>
      )}
    </div>
  );
}
