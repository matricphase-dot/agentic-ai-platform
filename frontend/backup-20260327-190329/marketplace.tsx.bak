"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  status: string;
  agent: {
    id: string;
    name: string;
    agentType: string;
    capabilities: string;
    reputationScore: number;
  };
}

export default function MarketplacePage() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const categories = ['all', 'healthcare', 'finance', 'education', 'support', 'analytics', 'development', 'general'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/templates');
      setTemplates(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load templates');
      console.error('Marketplace error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleDeploy = async (template: Template) => {
    if (!user) {
      alert('Please login to deploy an agent');
      return;
    }
    setDeployingId(template.id);
    try {
      const agentData = {
        name: template.title,
        description: template.description,
        capabilities: template.agent?.capabilities || "N/A",
        systemPrompt: `You are a ${template.title.toLowerCase()}. ${template.description}`,
        modelProvider: 'ollama-local',
        modelName: 'llama2',
        status: 'active',
        agentType: template.agent?.agentType || "general",
      };
      const res = await api.post('/agents', agentData);
      if (res.status === 201) {
        alert('Agent deployed successfully!');
        window.location.href = '/agents';
      }
    } catch (err: any) {
      alert('Failed to deploy agent. See console.');
      console.error(err);
    } finally {
      setDeployingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading marketplace...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Agent Marketplace</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="border rounded-lg p-6 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-2">{template.title}</h2>
            <p className="text-gray-600 mb-4">{template.description}</p>
            <div className="text-sm text-gray-500 mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {template.category}
              </span>
            </div>
            <div className="mb-4">
              <p><strong>Capabilities:</strong> {template.agent?.capabilities || "N/A"}</p>
              <p><strong>Price:</strong> {template.price} AGIX / {template.unit}</p>
            </div>
            <button
              onClick={() => handleDeploy(template)}
              disabled={deployingId === template.id}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {deployingId === template.id ? 'Deploying...' : 'Deploy'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

