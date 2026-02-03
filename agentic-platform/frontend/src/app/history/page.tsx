"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Execution {
  id: string;
  agentName: string;
  agentIcon: string;
  input: string;
  output: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
  executionTime: number;
  cost: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in production, fetch from API
    const mockExecutions: Execution[] = [
      {
        id: '1',
        agentName: 'Marketing Copywriter',
        agentIcon: '📝',
        input: 'Write a social media post about our new AI platform launch',
        output: '🚀 Exciting News! We just launched our AI Agent Platform...',
        timestamp: '2024-01-15 14:30:22',
        status: 'success',
        executionTime: 2.5,
        cost: 0.02
      },
      {
        id: '2',
        agentName: 'Code Assistant',
        agentIcon: '💻',
        input: 'Write a React component for a user profile card',
        output: '```tsx\ninterface ProfileCardProps {\n  name: string;\n  role: string;\n  ...\n```',
        timestamp: '2024-01-15 13:45:10',
        status: 'success',
        executionTime: 1.8,
        cost: 0.015
      },
      {
        id: '3',
        agentName: 'SEO Optimizer',
        agentIcon: '🚀',
        input: 'Optimize this blog post about machine learning',
        output: '✅ Added keywords: "machine learning", "AI", "data science"...',
        timestamp: '2024-01-15 11:20:05',
        status: 'success',
        executionTime: 3.2,
        cost: 0.025
      },
      {
        id: '4',
        agentName: 'Data Analyst',
        agentIcon: '📈',
        input: 'Analyze sales data from Q4 2023',
        output: '❌ Error: Invalid data format. Please upload CSV or Excel file.',
        timestamp: '2024-01-14 16:15:33',
        status: 'error',
        executionTime: 0.8,
        cost: 0.008
      },
      {
        id: '5',
        agentName: 'Customer Support',
        agentIcon: '🎯',
        input: 'Respond to customer complaint about late delivery',
        output: 'Generating response...',
        timestamp: '2024-01-14 10:05:47',
        status: 'pending',
        executionTime: 0,
        cost: 0
      },
      {
        id: '6',
        agentName: 'Content Summarizer',
        agentIcon: '📊',
        input: 'Summarize the 50-page research paper on neural networks',
        output: '📋 Summary: The paper discusses advanced neural network architectures...',
        timestamp: '2024-01-13 09:30:12',
        status: 'success',
        executionTime: 4.5,
        cost: 0.035
      },
    ];

    setExecutions(mockExecutions);
    setLoading(false);
  }, []);

  const filteredExecutions = filter === 'all' 
    ? executions 
    : executions.filter(exec => exec.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">Execution History</h1>
                <p className="text-gray-400">Track all your AI agent executions and performance</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-800">
                  <span className="text-gray-400 mr-2">Total Executions:</span>
                  <span className="text-white font-semibold">{executions.length}</span>
                </div>
                <div className="px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-800">
                  <span className="text-gray-400 mr-2">Total Cost:</span>
                  <span className="text-green-400 font-semibold">${executions.reduce((sum, exec) => sum + exec.cost, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap gap-2">
                {['all', 'success', 'error', 'pending'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                      filter === status
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {status} {status !== 'all' && `(${executions.filter(e => e.status === status).length})`}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search executions..."
                  className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                />
                <select className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>All time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-2xl font-bold text-white mb-2">
                {executions.filter(e => e.status === 'success').length}
              </div>
              <div className="text-gray-400">Successful Executions</div>
              <div className="mt-2 text-sm text-green-400">↑ 12% from last week</div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-2xl font-bold text-white mb-2">
                {executions.reduce((sum, exec) => sum + exec.cost, 0).toFixed(2)}
              </div>
              <div className="text-gray-400">Total Cost</div>
              <div className="mt-2 text-sm text-green-400">↓ 5% from last week</div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-2xl font-bold text-white mb-2">
                {(executions.reduce((sum, exec) => sum + exec.executionTime, 0) / executions.length).toFixed(2)}s
              </div>
              <div className="text-gray-400">Avg Execution Time</div>
              <div className="mt-2 text-sm text-red-400">↑ 0.3s from last week</div>
            </div>
            
            <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
              <div className="text-2xl font-bold text-white mb-2">
                {executions.filter(e => e.status === 'error').length}
              </div>
              <div className="text-gray-400">Failed Executions</div>
              <div className="mt-2 text-sm text-green-400">↓ 18% from last week</div>
            </div>
          </div>

          {/* Executions Table */}
          <div className="bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="py-4 px-6 text-left text-gray-400 font-medium">Agent</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium">Input</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium">Status</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium">Time</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium">Cost</th>
                    <th className="py-4 px-6 text-left text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExecutions.map((execution) => (
                    <tr 
                      key={execution.id} 
                      className="border-b border-gray-800/50 hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <span className="text-lg">{execution.agentIcon}</span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{execution.agentName}</div>
                            <div className="text-xs text-gray-500">{formatTimeAgo(execution.timestamp)}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="max-w-xs">
                          <div className="text-sm text-gray-300 line-clamp-2">{execution.input}</div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(execution.status)}`}>
                          {execution.status === 'pending' && (
                            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mr-2"></div>
                          )}
                          {execution.status === 'success' && '✓ '}
                          {execution.status === 'error' && '✗ '}
                          {execution.status.charAt(0).toUpperCase() + execution.status.slice(1)}
                        </span>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="text-white">{execution.executionTime}s</div>
                          <div className="text-xs text-gray-500">{execution.timestamp.split(' ')[0]}</div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium">
                          ${execution.cost.toFixed(3)}
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => router.push(`/agents/${execution.id}`)}
                            className="px-3 py-1 text-sm bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => {
                              // Re-run execution
                              alert(`Re-running ${execution.agentName}...`);
                            }}
                            className="px-3 py-1 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg"
                          >
                            Re-run
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredExecutions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold mb-2">No executions found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your filters or execute some agents first</p>
                <button 
                  onClick={() => router.push('/')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg font-medium text-white"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Pagination */}
            <div className="border-t border-gray-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Showing 1-{filteredExecutions.length} of {filteredExecutions.length} executions
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white">
                    ← Previous
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400">
                    1
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white">
                    2
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white">
                    3
                  </button>
                  <button className="px-3 py-1 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white">
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="mt-8 bg-gray-900/30 rounded-2xl border border-gray-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Export Execution Data</h3>
                <p className="text-sm text-gray-400">Download your execution history for analysis or reporting</p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300">
                  📥 CSV
                </button>
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300">
                  📥 Excel
                </button>
                <button className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 rounded-lg text-gray-300">
                  📥 JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}