"use client";

import { useState, useEffect } from 'react';

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/agents`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAgents(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading agents...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Agents</h1>
      {agents.length === 0 ? (
        <p>No agents yet. Create one via the marketplace or create page.</p>
      ) : (
        <ul>
          {agents.map(agent => (
            <li key={agent.id} className="border p-2 mb-2">
              <strong>{agent.name}</strong> – {agent.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
