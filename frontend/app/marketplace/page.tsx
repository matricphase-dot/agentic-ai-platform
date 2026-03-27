'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function MarketplacePage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await api.get('/templates');
        setTemplates(res.data);
      } catch (error) {
        console.error('Failed to fetch templates', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleDeploy = async (template) => {
    setDeploying(template.id);
    try {
      const agentData = {
        name: `${template.name} - ${new Date().toLocaleString()}`,
        description: template.description,
        config: template.config,
        templateId: template.id,
      };
      const res = await api.post('/agents', agentData);
      router.push(`/agents/${res.data.id}`);
    } catch (error) {
      console.error('Failed to deploy agent', error);
      alert('Failed to deploy agent. Please try again.');
    } finally {
      setDeploying(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64">Loading marketplace...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      {templates.length === 0 ? (
        <p>No templates available. Check back later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">{template.name}</h2>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-green-600">{template.price} tokens</span>
                <button
                  onClick={() => handleDeploy(template)}
                  disabled={deploying === template.id}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {deploying === template.id ? 'Deploying...' : 'Deploy'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
