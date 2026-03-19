'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AgentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAgent = async () => {
    try {
      const res = await axios.get(`/api/agents/${id}`);
      setAgent(res.data);
    } catch (error) {
      console.error('Failed to fetch agent', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAgent();
  }, [id]);

  const handlePublishToggle = async () => {
    try {
      if (agent.isPublic) {
        await axios.post(`/api/agents/${agent.id}/unpublish`);
      } else {
        await axios.post(`/api/agents/${agent.id}/publish`);
      }
      fetchAgent(); // refresh
    } catch (error) {
      alert('Failed to update public status');
    }
  };

  if (loading) return <div className="p-8">Loading agent...</div>;
  if (!agent) return <div className="p-8">Agent not found</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/agents" className="text-indigo-600 hover:underline">← Back to Agents</Link>
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
        <p className="text-gray-600 mb-4">{agent.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="font-medium">Type:</span> {agent.agentType}</div>
          <div><span className="font-medium">Status:</span> {agent.status}</div>
          <div><span className="font-medium">Reputation:</span> {agent.reputationScore}</div>
          <div><span className="font-medium">Hourly rate:</span> {agent.hourlyRate} $AGENT</div>
          <div><span className="font-medium">Success rate:</span> {agent.successRate}</div>
          <div><span className="font-medium">Created:</span> {new Date(agent.createdAt).toLocaleDateString()}</div>
        </div>

        {user && agent.ownerId === user.id && (
          <div className="mt-6 border-t pt-4">
            <button
              onClick={handlePublishToggle}
              className={`px-4 py-2 rounded text-white ${
                agent.isPublic ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {agent.isPublic ? 'Unpublish (make private)' : 'Publish (make public)'}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              {agent.isPublic
                ? 'This agent is visible to everyone on the Public Agents page.'
                : 'This agent is private. Only you can see it.'}
            </p>
          </div>
        )}

        {!agent.isPublic && user && agent.ownerId !== user.id && (
          <p className="text-gray-500 mt-4">This agent is private.</p>
        )}
      </div>
    </div>
  );
}