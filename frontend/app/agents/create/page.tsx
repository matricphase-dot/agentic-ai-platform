'use client';

import { useState } from 'react';
import axios from '../../../lib/axios';
import { useRouter } from 'next/navigation';

export default function CreateAgentPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    description: '',
    agentType: 'generic',
    model: 'llama3.2:3b',
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.7,
    capabilities: '',
    hourlyRate: 10,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build configuration object for Ollama
      const configuration = {
        provider: 'ollama',
        model: form.model,
        systemPrompt: form.systemPrompt,
        temperature: form.temperature,
        url: process.env.NEXT_PUBLIC_OLLAMA_URL || 'http://localhost:11434/api/generate',
      };
      const capabilitiesArray = form.capabilities.split(',').map(s => s.trim()).filter(Boolean);

      const res = await axios.post('/agents', {
        name: form.name,
        description: form.description,
        agentType: form.agentType,
        configuration,
        hourlyRate: form.hourlyRate,
        capabilities: capabilitiesArray,
      });
      alert('Agent created successfully!');
      router.push('/agents');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create a New AI Agent</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Agent Name</label>
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
          <label className="block mb-1">Agent Type</label>
          <select
            value={form.agentType}
            onChange={(e) => setForm({ ...form, agentType: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="generic">Generic</option>
            <option value="data-analysis">Data Analysis</option>
            <option value="content">Content Creation</option>
            <option value="coding">Coding</option>
            <option value="research">Research</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Ollama Model</label>
          <input
            type="text"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
            className="border p-2 w-full"
            placeholder="e.g., llama3.2:3b"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">System Prompt</label>
          <textarea
            value={form.systemPrompt}
            onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
            rows={2}
            className="border p-2 w-full"
            placeholder="Instructions for the agent's behavior"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Temperature (0.0 - 2.0)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="2"
            value={form.temperature}
            onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Capabilities (comma separated)</label>
          <input
            type="text"
            value={form.capabilities}
            onChange={(e) => setForm({ ...form, capabilities: e.target.value })}
            className="border p-2 w-full"
            placeholder="e.g., text-generation, summarization"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Hourly Rate ($AGENT)</label>
          <input
            type="number"
            step="0.01"
            value={form.hourlyRate}
            onChange={(e) => setForm({ ...form, hourlyRate: parseFloat(e.target.value) })}
            className="border p-2 w-full"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}
