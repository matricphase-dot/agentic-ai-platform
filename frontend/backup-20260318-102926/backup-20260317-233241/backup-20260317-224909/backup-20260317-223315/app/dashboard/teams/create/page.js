'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CreateTeamPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workflow_type: 'sequential',
  });

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const teamData = {
      ...formData,
      agent_ids: selectedAgents,
    };

    try {
      const response = await fetch('http://localhost:8000/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/teams/${data.id}`);
      } else {
        alert('Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Error creating team');
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = (agentId) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const workflowTypes = [
    {
      id: 'sequential',
      label: 'Sequential',
      description: 'Agents work one after another',
    },
    {
      id: 'parallel',
      label: 'Parallel',
      description: 'Agents work simultaneously',
    },
    {
      id: 'collaborative',
      label: 'Collaborative',
      description: 'Agents collaborate in real-time',
    },
    {
      id: 'hierarchical',
      label: 'Hierarchical',
      description: 'Manager-agent coordinates others',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Team</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Build a team of AI agents that work together
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Team Information */}
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-6 flex items-center text-xl font-bold">
                <span className="mr-2">👥</span> Team Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="e.g., Research Team, Content Creation Squad, Code Review Crew"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    placeholder="Describe the purpose and goals of this team..."
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Workflow Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {workflowTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() =>
                          setFormData({ ...formData, workflow_type: type.id })
                        }
                        className={`cursor-pointer rounded-lg border p-4 transition ${
                          formData.workflow_type === type.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-300 hover:border-purple-300 dark:border-gray-600'
                        }`}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="mt-1 text-sm text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-gray-300 px-6 py-3 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedAgents.length === 0}
                className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-medium text-white transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              >
                {loading
                  ? 'Creating Team...'
                  : `Create Team (${selectedAgents.length} agents)`}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column - Agent Selection */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">Select Agents</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Choose AI agents to include in your team ({selectedAgents.length}{' '}
              selected)
            </p>

            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {agents.length > 0 ? (
                agents.map((agent) => (
                  <div
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={`cursor-pointer rounded-lg border p-3 transition ${
                      selectedAgents.includes(agent.id)
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 hover:border-purple-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                        <span className="text-sm text-white">🤖</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-gray-500">
                          {agent.role}
                        </div>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          selectedAgents.includes(agent.id)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-400'
                        }`}
                      >
                        {selectedAgents.includes(agent.id) && (
                          <div className="flex items-center justify-center text-xs text-white">
                            ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-gray-500">
                  No agents available. Create agents first.
                </div>
              )}
            </div>

            {/* Selected Agents Preview */}
            {selectedAgents.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="mb-3 font-medium">Selected Agents:</h3>
                <div className="flex flex-wrap gap-2">
                  {agents
                    .filter((agent) => selectedAgents.includes(agent.id))
                    .map((agent) => (
                      <div
                        key={agent.id}
                        className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      >
                        {agent.name}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
