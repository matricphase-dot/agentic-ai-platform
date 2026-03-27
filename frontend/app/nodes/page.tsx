'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Node {
  id: string;
  name: string;
  endpoint: string;
  status: string;
  lastPing: string;
  specs: any;
  location?: string;
  version?: string;
}

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    try {
      const res = await api.get('/nodes');
      setNodes(res.data);
    } catch (err) {
      console.error('Failed to fetch nodes', err);
      setError('Failed to load nodes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      // The backend endpoint is /nodes/register
      await api.post('/nodes/register', { name, endpoint });
      setSuccess('Node registered successfully');
      setName('');
      setEndpoint('');
      fetchNodes();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register node');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading nodes...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Compute Nodes</h1>

      {/* Registration Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Register a New Node</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Node Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Endpoint URL</label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Registering...' : 'Register Node'}
          </button>
        </form>
      </div>

      {/* Node List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Nodes</h2>
        {nodes.length === 0 ? (
          <p>No nodes registered yet.</p>
        ) : (
          <div className="space-y-4">
            {nodes.map((node) => (
              <div key={node.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold">{node.name}</h3>
                <p>Endpoint: {node.endpoint}</p>
                <p>Status: {node.status}</p>
                <p>Last Ping: {node.lastPing ? new Date(node.lastPing).toLocaleString() : 'Never'}</p>
                {node.specs && (
                  <pre className="mt-2 text-sm bg-gray-100 p-2 rounded">
                    {JSON.stringify(node.specs, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
