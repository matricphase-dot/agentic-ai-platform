'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ExecuteWorkflowPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState(null);
  const [workflowType, setWorkflowType] = useState('sequential');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchTeams();
  }, [isAuthenticated, token]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:8000/teams', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTeams(data);
      if (data.length > 0) {
        setSelectedTeam(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (e) => {
    e.preventDefault();
    if (!selectedTeam || !task.trim()) {
      alert('Please select a team and enter a task');
      return;
    }

    setExecuting(true);
    setResults(null);

    try {
      const response = await fetch(
        `http://localhost:8000/teams/${selectedTeam}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            task: task,
            workflow_type: workflowType,
          }),
        }
      );

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error executing workflow:', error);
      setResults({
        error: 'Failed to execute workflow',
        message: error.message,
      });
    } finally {
      setExecuting(false);
    }
  };

  const selectedTeamData = teams.find((t) => t.id === selectedTeam);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Execute Workflow</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Run complex tasks with collaborative AI teams
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Execution Form */}
        <div className="lg:col-span-2">
          <div className="mb-6 rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-6 flex items-center text-xl font-bold">
              <span className="mr-2">⚡</span> Configure Workflow
            </h2>

            <form onSubmit={executeWorkflow} className="space-y-6">
              {/* Team Selection */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Select Team *
                </label>
                {teams.length > 0 ? (
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                  >
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} ({team.member_count} agents)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="py-4 text-center text-gray-500">
                    <p>No teams available. Create a team first.</p>
                    <Link
                      href="/dashboard/teams/create"
                      className="mt-2 inline-block text-green-600 hover:text-green-700"
                    >
                      Create Team →
                    </Link>
                  </div>
                )}
              </div>

              {/* Workflow Type */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Workflow Pattern
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      id: 'sequential',
                      label: 'Sequential',
                      icon: '➡️',
                      description: 'Agents work in sequence',
                    },
                    {
                      id: 'parallel',
                      label: 'Parallel',
                      icon: '↔️',
                      description: 'Agents work simultaneously',
                    },
                    {
                      id: 'collaborative',
                      label: 'Collaborative',
                      icon: '🔄',
                      description: 'Real-time collaboration',
                    },
                    {
                      id: 'hierarchical',
                      label: 'Hierarchical',
                      icon: '📊',
                      description: 'Manager coordinates team',
                    },
                  ].map((type) => (
                    <div
                      key={type.id}
                      onClick={() => setWorkflowType(type.id)}
                      className={`cursor-pointer rounded-lg border p-4 transition ${
                        workflowType === type.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 hover:border-green-300 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-2 text-xl">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.label}</div>
                          <div className="text-xs text-gray-500">
                            {type.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Input */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Task Description *
                </label>
                <textarea
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  rows="6"
                  placeholder="Describe the task you want the AI team to execute. Be specific about what you need..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>

              {/* Cost Estimate */}
              {selectedTeamData && (
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Estimated Cost</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Based on {selectedTeamData.member_count} agents
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      $
                      {(
                        (selectedTeamData.agents || []).reduce(
                          (sum, agent) => sum + (agent.cost_per_query || 0.01),
                          0
                        ) * 0.1
                      ).toFixed(3)}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  executing ||
                  !selectedTeam ||
                  !task.trim() ||
                  teams.length === 0
                }
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 py-3 font-medium text-white transition hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
              >
                {executing ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-3 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Executing Workflow...
                  </div>
                ) : (
                  'Execute Workflow'
                )}
              </button>
            </form>
          </div>

          {/* Results Display */}
          {results && (
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-6 flex items-center text-xl font-bold">
                <span className="mr-2">📊</span> Workflow Results
              </h2>

              {results.error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <div className="font-medium text-red-800 dark:text-red-300">
                    Error
                  </div>
                  <div className="text-red-600 dark:text-red-400">
                    {results.message}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="font-medium text-green-800 dark:text-green-300">
                      Workflow Completed Successfully!
                    </div>
                    <div className="mt-1 text-green-600 dark:text-green-400">
                      Task completed in {results.execution_time || 'unknown'}{' '}
                      seconds
                    </div>
                  </div>

                  {/* Agent Contributions */}
                  <div>
                    <h3 className="mb-3 font-bold">Agent Contributions</h3>
                    <div className="space-y-3">
                      {results.agent_results?.map((agentResult, index) => (
                        <div
                          key={index}
                          className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                        >
                          <div className="mb-2 flex items-center">
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                              <span className="text-xs text-white">🤖</span>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">
                                {agentResult.agent_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Role: {agentResult.agent_role}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              Cost: ${agentResult.cost || '0.00'}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {agentResult.contribution}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Final Result */}
                  <div>
                    <h3 className="mb-3 font-bold">Final Result</h3>
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-700 dark:text-gray-300">
                          {results.final_result}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  {results.total_cost && (
                    <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Total Cost</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${results.total_cost}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Team Info & Examples */}
        <div className="space-y-6">
          {/* Selected Team Info */}
          {selectedTeamData && (
            <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
              <h2 className="mb-4 text-xl font-bold">Selected Team</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                    <span className="text-white">👥</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold">
                      {selectedTeamData.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedTeamData.member_count} agents •{' '}
                      {selectedTeamData.workflow_type} workflow
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 font-medium">Team Members:</h3>
                  <div className="space-y-2">
                    {(selectedTeamData.agents || []).map((agent, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                          <span className="text-xs text-white">🤖</span>
                        </div>
                        <span className="flex-1">{agent.name}</span>
                        <span className="text-gray-500">
                          ${agent.cost_per_query}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <Link
                    href={`/dashboard/teams/${selectedTeamData.id}`}
                    className="block w-full rounded-lg bg-purple-600 py-2 text-center text-white transition hover:bg-purple-700"
                  >
                    View Team Details
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Example Tasks */}
          <div className="rounded-xl bg-gradient-to-r from-green-50 to-blue-50 p-6 shadow-lg dark:from-gray-800 dark:to-gray-900">
            <h2 className="mb-4 text-xl font-bold">Example Tasks</h2>
            <div className="space-y-3">
              {[
                'Research the latest developments in quantum computing and summarize key findings',
                'Create a marketing plan for a new AI product launch',
                'Analyze this dataset and provide insights with visualizations',
                'Write a technical blog post about machine learning model deployment',
                'Review this code for security vulnerabilities and suggest improvements',
              ].map((example, index) => (
                <button
                  key={index}
                  onClick={() => setTask(example)}
                  className="block w-full rounded-lg border border-green-200 p-3 text-left transition hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {example.substring(0, 80)}...
                  </div>
                  <div className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Click to use
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Workflow Tips */}
          <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold">💡 Workflow Tips</h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>Be specific about your requirements</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>
                  Complex tasks work better with hierarchical workflows
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>Monitor costs in real-time on the dashboard</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span>
                  Review agent contributions to optimize team composition
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
