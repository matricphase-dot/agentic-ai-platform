'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateAgentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    type: 'chatbot',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Agent created successfully!');
        router.push('/agents');
      }
    } catch (error) {
      alert('Error creating agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">
        Create New Agent
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border bg-white p-6 shadow"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Agent Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            placeholder="Enter agent name"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Agent Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="chatbot">Chatbot</option>
            <option value="analytics">Analytics</option>
            <option value="content">Content Generator</option>
            <option value="development">Development</option>
            <option value="research">Research</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe what this agent does..."
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  );
}
