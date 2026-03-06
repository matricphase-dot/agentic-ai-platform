'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [connectors, setConnectors] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchConnectors();
    fetchIntegrations();
  }, []);

  const fetchConnectors = async () => {
    try {
      const res = await axios.get('/api/integrations/connectors');
      setConnectors(res.data);
    } catch (error) {
      console.error('Failed to fetch connectors', error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const res = await axios.get('/api/integrations');
      setIntegrations(res.data);
    } catch (error) {
      console.error('Failed to fetch integrations', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (connector: any) => {
    setSelectedConnector(connector);
    const defaults: Record<string, any> = {};
    if (connector.configSchema?.properties) {
      for (const key of Object.keys(connector.configSchema.properties)) {
        defaults[key] = '';
      }
    }
    setConfigValues(defaults);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConnector) return;
    try {
      await axios.post('/api/integrations', {
        connectorId: selectedConnector.id,
        name: selectedConnector.name,
        config: configValues
      });
      setShowModal(false);
      fetchIntegrations();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to connect');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disconnect?')) return;
    try {
      await axios.delete(/api/integrations/);
      fetchIntegrations();
    } catch (error) {
      alert('Failed to disconnect');
    }
  };

  const handleOAuth = (connector: any) => {
    alert('OAuth flow not yet implemented – you would redirect to: ' + connector.authConfig.authorizationUrl);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map(connector => {
          const existing = integrations.find(i => i.connectorId === connector.id);
          return (
            <div key={connector.id} className="border rounded p-4 flex flex-col">
              <div className="flex items-center mb-3">
                <span className="text-2xl mr-3">🔌</span>
                <div>
                  <h2 className="font-semibold">{connector.name}</h2>
                  <p className="text-sm text-gray-600">{connector.description}</p>
                </div>
              </div>
              {existing ? (
                <div className="mt-2">
                  <p className="text-sm text-green-600 mb-2">✅ Connected</p>
                  <button
                    onClick={() => handleDelete(existing.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => connector.authType === 'oauth2' ? handleOAuth(connector) : handleConnect(connector)}
                  className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showModal && selectedConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Connect {selectedConnector.name}</h2>
            <form onSubmit={handleSubmit}>
              {selectedConnector.configSchema?.properties && Object.keys(selectedConnector.configSchema.properties).map(key => {
                const prop = selectedConnector.configSchema.properties[key];
                return (
                  <div key={key} className="mb-4">
                    <label className="block text-sm font-medium mb-1">{prop.title || key}</label>
                    <input
                      type="text"
                      value={configValues[key] || ''}
                      onChange={(e) => setConfigValues({ ...configValues, [key]: e.target.value })}
                      className="border p-2 w-full rounded"
                      required={prop.required}
                    />
                  </div>
                );
              })}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Connect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
