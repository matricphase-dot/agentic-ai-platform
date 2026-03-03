'use client';

import { useState, useEffect } from 'react';
import axios from '../../../lib/axios';
import { useRouter } from 'next/navigation';

export default function CreateBlueprintPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    agentId: '',
    name: '',
    description: '',
    price: '',
    royaltyRate: '',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/agents/my-agents');
      if (Array.isArray(res.data)) {
        setAgents(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setAgents(res.data.data);
      } else {
        setAgents([]);
      }
    } catch (error) {
      console.error('Failed to fetch agents', error);
      setAgents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/franchise/blueprints', form);
      alert('Blueprint created!');
      router.push('/franchise');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create blueprint');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Agent Blueprint</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Source Agent</label>
          <select
            value={form.agentId}
            onChange={(e) => setForm({ ...form, agentId: e.target.value })}
            className="border p-2 w-full"
            required
          >
            <option value="">Select agent</option>
            {agents.map((agent: any) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Blueprint Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Price ($AGENT)</label>
          <input
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Royalty Rate (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={form.royaltyRate}
            onChange={(e) => setForm({ ...form, royaltyRate: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Create Blueprint
        </button>
      </form>
    </div>
  );
}
