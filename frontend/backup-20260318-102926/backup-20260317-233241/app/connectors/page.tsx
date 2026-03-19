'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Cog6ToothIcon, PlusIcon, TrashIcon, LinkIcon } from '@heroicons/react/24/outline';

export default function ConnectorsPage() {
  const { user } = useAuth();
  const [connectors, setConnectors] = useState([]);
  const [myConnections, setMyConnections] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnector, setSelectedConnector] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showBindModal, setShowBindModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<any>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [permissions, setPermissions] = useState('read');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [connRes, myRes, agentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connectors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/connectors/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      const connData = await connRes.json();
      const myData = await myRes.json();
      const agentsData = await agentsRes.json();
      setConnectors(connData.connectors);
      setMyConnections(myData.connections);
      setAgents(agentsData.agents);
    } catch (error) {
      console.error('Failed to fetch connectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (connectorId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connectors/${connectorId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ credentials: { apiKey } }),
      });
      if (res.ok) {
        alert('Connected successfully!');
        setShowConnectModal(false);
        setApiKey('');
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Disconnect this service?')) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connectors/my/${connectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleBind = async () => {
    if (!selectedConnection || !selectedAgentId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connectors/my/${selectedConnection.id}/bind`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ agentId: selectedAgentId, permissions: [permissions] }),
      });
      if (res.ok) {
        alert('Agent bound successfully!');
        setShowBindModal(false);
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading connectors...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Integrations</h1>

      {/* Connected Services */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Connected Services</h2>
        {myConnections.length === 0 ? (
          <p className="text-gray-500">No connected services yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myConnections.map((conn: any) => (
              <div key={conn.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                <div className="flex items-center mb-3">
                  <img src={conn.connector.logoUrl || '/default-logo.png'} alt={conn.connector.name} className="w-8 h-8 mr-2" />
                  <h3 className="font-semibold">{conn.connector.name}</h3>
                </div>
                <p className="text-sm text-gray-600 mb-2">Status: {conn.status}</p>
                <p className="text-xs text-gray-400 mb-3">Last used: {conn.lastUsed ? new Date(conn.lastUsed).toLocaleString() : 'Never'}</p>
                <div className="flex justify-between">
                  <button
                    onClick={() => { setSelectedConnection(conn); setShowBindModal(true); }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Bind Agent
                  </button>
                  <button
                    onClick={() => handleDisconnect(conn.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Connectors */}
      <h2 className="text-xl font-semibold mb-4">Available Connectors</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectors.map((conn: any) => (
          <div key={conn.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="flex items-center mb-3">
              <img src={conn.logoUrl || '/default-logo.png'} alt={conn.name} className="w-8 h-8 mr-2" />
              <h3 className="font-semibold">{conn.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{conn.description}</p>
            <p className="text-xs text-gray-400 mb-3">Auth: {conn.authType}</p>
            <button
              onClick={() => { setSelectedConnector(conn); setShowConnectModal(true); }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Connect
            </button>
          </div>
        ))}
      </div>

      {/* Connect Modal */}
      {showConnectModal && selectedConnector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Connect to {selectedConnector.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="text"
                className="w-full border rounded p-2"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleConnect(selectedConnector.id)}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Connect
              </button>
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bind Modal */}
      {showBindModal && selectedConnection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Bind Agent to {selectedConnection.connector.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Agent</label>
              <select
                className="w-full border rounded p-2"
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
              >
                <option value="">Choose an agent</option>
                {agents.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Permissions</label>
              <select
                className="w-full border rounded p-2"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
              >
                <option value="read">Read only</option>
                <option value="write">Write</option>
                <option value="read,write">Read & Write</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBind}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                disabled={!selectedAgentId}
              >
                Bind
              </button>
              <button
                onClick={() => setShowBindModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
