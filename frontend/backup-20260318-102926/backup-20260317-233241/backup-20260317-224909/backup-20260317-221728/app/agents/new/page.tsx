'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  CpuChipIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';

const agentTemplates = [
  {
    id: 'chatbot',
    name: 'Chatbot Agent',
    description: 'Conversational AI for customer support',
    icon: ChatBubbleLeftRightIcon,
    color: 'bg-blue-500',
  },
  {
    id: 'analytics',
    name: 'Analytics Agent',
    description: 'Data processing and insights',
    icon: ChartBarIcon,
    color: 'bg-green-500',
  },
  {
    id: 'content',
    name: 'Content Agent',
    description: 'AI content generation',
    icon: DocumentTextIcon,
    color: 'bg-purple-500',
  },
  {
    id: 'development',
    name: 'Developer Agent',
    description: 'Code generation assistance',
    icon: CodeBracketIcon,
    color: 'bg-orange-500',
  },
  {
    id: 'research',
    name: 'Research Agent',
    description: 'Data collection and analysis',
    icon: MagnifyingGlassIcon,
    color: 'bg-red-500',
  },
  {
    id: 'custom',
    name: 'Custom Agent',
    description: 'Build from scratch',
    icon: BeakerIcon,
    color: 'bg-gray-500',
  },
];

export default function CreateAgentPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState('chatbot');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: selectedTemplate,
          status: 'idle',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Agent "${formData.name}" created successfully!`);
        router.push('/agents');
      }
    } catch (error) {
      alert('Failed to create agent. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="mb-4 flex items-center">
          <Link
            href="/agents"
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Agents
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
        <p className="mt-2 text-gray-600">
          Configure your AI agent for autonomous tasks
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Template Selection */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center text-xl font-bold text-gray-900">
            <CpuChipIcon className="mr-2 h-6 w-6 text-blue-600" />
            Step 1: Select Agent Template
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agentTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-all ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="mb-3 flex items-center">
                    <div className={`${template.color} mr-3 rounded-lg p-2`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {template.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Configuration */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Step 2: Basic Configuration
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Agent Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Customer Support Bot"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                AI Model
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe what this agent does..."
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Step 3: Advanced Settings
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Temperature: {formData.temperature}
              </label>
              <input
                type="range"
                name="temperature"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={handleChange}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Precise (0)</span>
                <span>Creative (1)</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Max Tokens: {formData.maxTokens}
              </label>
              <input
                type="range"
                name="maxTokens"
                min="100"
                max="4000"
                step="100"
                value={formData.maxTokens}
                onChange={handleChange}
                className="w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>Short</span>
                <span>Long</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Link
            href="/agents"
            className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.name}
            className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Agent'}
          </button>
        </div>
      </form>
    </div>
  );
}
