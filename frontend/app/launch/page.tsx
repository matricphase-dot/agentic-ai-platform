"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function LaunchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capabilities: '',
    systemPrompt: 'You are a helpful assistant.',
    modelProvider: 'ollama-local',
    modelName: 'llama2',
    hourlyRate: 10,
    agentType: 'CUSTOM'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name || 'New Agent',
          description: formData.description,
          capabilities: formData.capabilities,
          systemPrompt: formData.systemPrompt,
          modelProvider: formData.modelProvider,
          modelName: formData.modelName,
          status: 'active',
          agentType: formData.agentType,
          hourlyRate: formData.hourlyRate
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent');
      }

      toast.success('Agent created successfully!');
      router.push('/agents');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Launch New Agent</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Agent Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Capabilities (comma separated)</label>
          <input
            type="text"
            name="capabilities"
            value={formData.capabilities}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">System Prompt</label>
          <textarea
            name="systemPrompt"
            value={formData.systemPrompt}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hourly Rate ($AGENT)</label>
          <input
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            min="0"
            step="0.1"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}


