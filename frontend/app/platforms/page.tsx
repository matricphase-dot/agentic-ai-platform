'use client';

import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import Link from 'next/link';

export default function PlatformsPage() {
  const [connections, setConnections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [platform, setPlatform] = useState('');
  const [credentials, setCredentials] = useState('');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const res = await axios.get('/platforms/connections');
      if (Array.isArray(res.data)) {
        setConnections(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setConnections(res.data.data);
      } else {
        setConnections([]);
      }
    } catch (error) {
      console.error('Failed to fetch connections', error);
      setConnections([]);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let creds;
      try {
        creds = JSON.parse(credentials);
      } catch {
        alert('Credentials must be valid JSON');
        return;
      }
      await axios.post('/platforms/connect', { platform, credentials: creds });
      alert('Platform connected successfully!');
      setShowForm(false);
      setPlatform('');
      setCredentials('');
      fetchConnections();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to connect');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this connection?')) return;
    try {
      await axios.delete(`/platforms/connections/${id}`);
      alert('Connection revoked');
      fetchConnections();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to revoke');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Inter‑Platform Agents</h1>
      <p className="mb-4">Connect your external cloud accounts to deploy agents and earn revenue.</p>

      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6"
      >
        {showForm ? 'Cancel' : '+ Connect New Platform'}
      </button>

      {showForm && (
        <form onSubmit={handleConnect} className="mb-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Connect Platform</h2>
          <div className="mb-4">
            <label className="block mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="border p-2 w-full"
              required
            >
              <option value="">Select platform</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
              <option value="openai">OpenAI</option>
              <option value="google">Google Cloud</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Credentials (JSON)</label>
            <textarea
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              rows={5}
              className="border p-2 w-full font-mono text-sm"
              placeholder='{"apiKey": "..."}'
              required
            />
          </div>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Connect
          </button>
        </form>
      )}

      <h2 className="text-2xl font-semibold mb-4">Your Connections</h2>
      {connections.length === 0 ? (
        <p>No platform connections yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Status</th>
              <th>Last Used</th>
              <th>Deployments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((conn: any) => (
              <tr key={conn.id}>
                <td className="capitalize">{conn.platform}</td>
                <td>
                  <span className={`px-2 py-1 rounded ${conn.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {conn.status}
                  </span>
                </td>
                <td>{conn.lastUsed ? new Date(conn.lastUsed).toLocaleString() : 'Never'}</td>
                <td>{conn.deployments?.length || 0}</td>
                <td>
                  <Link href={`/platforms/${conn.id}`} className="text-blue-600 hover:underline mr-2">
                    View
                  </Link>
                  {conn.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(conn.id)}
                      className="text-red-600 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
