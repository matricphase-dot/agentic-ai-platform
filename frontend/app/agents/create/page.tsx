"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import axios from 'axios';

export default function CreateAgentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    capabilities: '',
    systemPrompt: '',
    modelProvider: 'ollama-local',
    modelName: 'llama2',
    agentType: 'CUSTOM',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/agents', {
        name: form.name,
        description: form.description,
        capabilities: form.capabilities,
        systemPrompt: form.systemPrompt,
        modelProvider: form.modelProvider,
        modelName: form.modelName,
        status: 'active',
        agentType: form.agentType,
      });
      if (res.status === 201) {
        alert('Agent created successfully!');
        router.push('/agents');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Agent</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Capabilities (comma separated)</label>
          <input
            type="text"
            name="capabilities"
            value={form.capabilities}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">System Prompt</label>
          <textarea
            name="systemPrompt"
            value={form.systemPrompt}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Model Provider</label>
          <input
            type="text"
            name="modelProvider"
            value={form.modelProvider}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Model Name</label>
          <input
            type="text"
            name="modelName"
            value={form.modelName}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}
