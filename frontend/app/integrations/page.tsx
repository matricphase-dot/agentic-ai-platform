"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await axios.get('/api/integrations');
      setIntegrations(res.data);
    } catch (err) {
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect?')) return;
    try {
      await axios.delete(`/api/integrations/${id}`);
      fetchIntegrations();
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading integrations...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>
      {integrations.length === 0 ? (
        <p>No integrations connected. Go to the marketplace to connect services.</p>
      ) : (
        <div className="space-y-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <h2 className="font-semibold">{integration.name}</h2>
                <p className="text-sm text-gray-500">Connected via {integration.connector?.name}</p>
              </div>
              <button
                onClick={() => handleDelete(integration.id)}
                className="text-red-600 hover:text-red-800"
              >
                Disconnect
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
