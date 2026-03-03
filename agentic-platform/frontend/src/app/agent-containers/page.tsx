// frontend/src/app/agent-containers/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface AgentContainer {
  id: number;
  name: string;
  description: string;
  container_id: string;
  status: string;
  model_name: string;
  memory_limit_mb: number;
  cpu_limit: number;
  created_at: string;
  last_started: string | null;
}

export default function AgentContainersPage() {
  const [containers, setContainers] = useState<AgentContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState<number | null>(null);

  useEffect(() => {
    fetchContainers();
  }, []);

  const fetchContainers = async () => {
    try {
      const response = await api.get('/api/v1/agent-containers');
      setContainers(response.data);
    } catch (error: any) {
      console.error('Error fetching containers:', error);
      toast.error('Failed to load agent containers');
    } finally {
      setLoading(false);
    }
  };

  const deployContainer = async (containerId: number) => {
    try {
      setDeploying(containerId);
      
      const openaiKey = prompt('Enter your OpenAI API key for this agent:');
      if (!openaiKey) return;

      await api.post(`/api/v1/agent-containers/${containerId}/deploy`, {
        openai_api_key: openaiKey
      });

      toast.success('Agent container deployed successfully!');
      fetchContainers();
    } catch (error: any) {
      console.error('Error deploying container:', error);
      toast.error(error.response?.data?.detail || 'Failed to deploy container');
    } finally {
      setDeploying(null);
    }
  };

  const startContainer = async (containerId: number) => {
    try {
      await api.post(`/api/v1/agent-containers/${containerId}/start`);
      toast.success('Agent container started!');
      fetchContainers();
    } catch (error: any) {
      console.error('Error starting container:', error);
      toast.error(error.response?.data?.detail || 'Failed to start container');
    }
  };

  const stopContainer = async (containerId: number) => {
    try {
      await api.post(`/api/v1/agent-containers/${containerId}/stop`);
      toast.success('Agent container stopped!');
      fetchContainers();
    } catch (error: any) {
      console.error('Error stopping container:', error);
      toast.error(error.response?.data?.detail || 'Failed to stop container');
    }
  };

  const deleteContainer = async (containerId: number) => {
    if (!confirm('Are you sure you want to delete this agent container?')) {
      return;
    }

    try {
      await api.delete(`/api/v1/agent-containers/${containerId}`);
      toast.success('Agent container deleted!');
      fetchContainers();
    } catch (error: any) {
      console.error('Error deleting container:', error);
      toast.error('Failed to delete container');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'stopped': return 'bg-red-100 text-red-800';
      case 'deployed': return 'bg-yellow-100 text-yellow-800';
      case 'created': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agent Containers</h1>
          <p className="text-gray-600 mt-2">Deploy and manage AI agent containers</p>
        </div>
        <Link
          href="/agent-containers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          + Create New Container
        </Link>
      </div>

      {containers.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="mx-auto w-24 h-24 mb-6 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No agent containers yet</h3>
          <p className="text-gray-600 mb-6">Create your first AI agent container to get started</p>
          <Link
            href="/agent-containers/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Container
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {containers.map((container) => (
            <div key={container.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{container.name}</h3>
                    <p className="text-gray-600 text-sm">{container.description || 'No description'}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(container.status)}`}>
                    {container.status}
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    <span>Model: {container.model_name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                    <span>CPU: {container.cpu_limit} cores</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span>Memory: {container.memory_limit_mb}MB</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!container.container_id && (
                    <button
                      onClick={() => deployContainer(container.id)}
                      disabled={deploying === container.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {deploying === container.id ? 'Deploying...' : 'Deploy'}
                    </button>
                  )}

                  {container.container_id && container.status !== 'running' && container.status !== 'deployed' && (
                    <button
                      onClick={() => startContainer(container.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Start
                    </button>
                  )}

                  {container.status === 'running' && (
                    <button
                      onClick={() => stopContainer(container.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Stop
                    </button>
                  )}

                  <button
                    onClick={() => deleteContainer(container.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}