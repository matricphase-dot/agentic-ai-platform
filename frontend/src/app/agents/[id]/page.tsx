'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/services/api';

interface Agent {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  instructions: string;
  input_template: string;
}

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  // FIXED: Handle null/undefined params
  const agentId = params?.id ? String(params.id) : '';
  
  if (!agentId) {
    router.push('/marketplace');
    return null;
  }

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [executionResult, setExecutionResult] = useState('');
  const [userInput, setUserInput] = useState('');
  const [executing, setExecuting] = useState(false);
  useEffect(() => {
    fetchAgentDetails();
    fetchExecutionHistory();
  }, [agentId]);

  const fetchAgentDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/agents/${agentId}`);
      const data = await response.json();
      setAgent(data);
    } catch (error) {
      toast.error('Failed to load agent details');
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/history?agent_id=${agentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setExecutionHistory(data);
    } catch (error) {
      console.error('Failed to load execution history:', error);
    }
  };

  const handleExecute = async () => {
    if (!input.trim()) {
      toast.error('Please enter input for the agent');
      return;
    }

    setExecuting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/v1/agents/${agentId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });

      const data = await response.json();
      setOutput(data.response || data.output || 'No response received');
      toast.success('Agent executed successfully!');
      
      // Refresh execution history
      fetchExecutionHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute agent');
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Agent not found</h1>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-400 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold mb-2">{agent.name}</h1>
          <p className="text-gray-400">{agent.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 mb-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center text-3xl`}>
                  {agent.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{agent.name}</h2>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-400">
                    {agent.category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                  <p className="text-gray-300">{agent.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Category</h3>
                  <p className="text-gray-300">{agent.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Usage Tips</h3>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Provide clear and specific input</li>
                    <li>• Use examples for better results</li>
                    <li>• Review output before using</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Execution Panel */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Execute Agent</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Input
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                  placeholder="Enter your input here..."
                />
              </div>
              
              <button
                onClick={handleExecute}
                disabled={executing}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-semibold text-white transition-all duration-200 disabled:opacity-50"
              >
                {executing ? (
                  <span className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Executing...
                  </span>
                ) : (
                  'Execute Agent'
                )}
              </button>
            </div>

            {/* Output Panel */}
            {output && (
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6">Output</h2>
                <div className="bg-gray-950 rounded-lg p-4 border border-gray-800">
                  <pre className="text-white whitespace-pre-wrap">{output}</pre>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(output)}
                    className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300"
                  >
                    Copy Output
                  </button>
                  <button
                    onClick={() => setOutput('')}
                    className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Execution History */}
            <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6">
              <h2 className="text-2xl font-bold mb-6">Recent Executions</h2>
              
              {executionHistory.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No execution history yet</p>
              ) : (
                <div className="space-y-4">
                  {executionHistory.slice(0, 5).map((execution) => (
                    <div
                      key={execution.id}
                      className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm text-gray-400">
                          {new Date(execution.created_at).toLocaleString()}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          execution.status === 'success' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {execution.status}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                        <span className="text-gray-500">Input:</span> {execution.input}
                      </p>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        <span className="text-gray-500">Output:</span> {execution.output}
                      </p>
                    </div>
                  ))}
                  
                  {executionHistory.length > 5 && (
                    <Link
                      href="/history"
                      className="block text-center text-blue-400 hover:text-blue-300 py-2"
                    >
                      View all executions →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}