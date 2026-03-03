'use client';

import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import Link from 'next/link';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/agents/my-agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Failed to fetch agents', error);
      setAgents([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this agent?')) return;
    try {
      await axios.delete(`/agents/${id}`);
      fetchAgents();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">My Agents</h1>
      <Link href="/agents/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 inline-block">
        + Create New Agent
      </Link>

      {agents.length === 0 ? (
        <p>You haven't created any agents yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Model</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent: any) => (
              <tr key={agent.id}>
                <td>{agent.name}</td>
                <td>{agent.agentType}</td>
                <td>{agent.status}</td>
                <td>{agent.configuration?.model || 'N/A'}</td>
                <td>
                  <Link href={`/agents/${agent.id}`} className="text-blue-600 hover:underline mr-2">View</Link>
                  <button onClick={() => handleDelete(agent.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
