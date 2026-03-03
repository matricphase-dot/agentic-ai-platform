'use client';

import { useState, useEffect } from 'react';
import axios from '../../../../lib/axios';
import { useRouter } from 'next/navigation';

export default function NewListingPage() {
  const router = useRouter();
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({
    agentId: '',
    title: '',
    description: '',
    category: 'data-analysis',
    price: '',
    unit: 'hour',
  });

  useEffect(() => {
    fetchAgents();
  }, []);

const fetchAgents = async () => {
  try {
    console.log('Fetching agents...');
    const res = await axios.get('/agents/my-agents');
    console.log('Response:', res);
    if (Array.isArray(res.data)) {
      setAgents(res.data);
    } else if (res.data && Array.isArray(res.data.data)) {
      setAgents(res.data.data);
    } else {
      console.warn('Unexpected agents response format:', res.data);
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
      await axios.post('/marketplace/listings', form);
      alert('Listing created!');
      router.push('/marketplace');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create listing');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Service Listing</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Agent</label>
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
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="data-analysis">Data Analysis</option>
            <option value="content">Content Creation</option>
            <option value="coding">Coding</option>
            <option value="research">Research</option>
            <option value="other">Other</option>
          </select>
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
          <label className="block mb-1">Unit</label>
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="hour">Per Hour</option>
            <option value="task">Per Task</option>
            <option value="project">Project</option>
          </select>
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Create Listing
        </button>
      </form>
    </div>
  );
}

