'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { PlusIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function MyBlueprints() {
  const { user } = useAuth();
  const [blueprints, setBlueprints] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [blueprintName, setBlueprintName] = useState('');
  const [blueprintDesc, setBlueprintDesc] = useState('');
  const [price, setPrice] = useState(100);
  const [royaltyRate, setRoyaltyRate] = useState(10);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [bpRes, agentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/replication/my-blueprints`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      const bpData = await bpRes.json();
      const agentsData = await agentsRes.json();
      setBlueprints(bpData.blueprints);
      setAgents(agentsData.agents);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/replication/blueprints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          agentId: selectedAgentId,
          name: blueprintName,
          description: blueprintDesc,
          price,
          royaltyRate: royaltyRate / 100,
        }),
      });
      if (res.ok) {
        alert('Blueprint created!');
        setShowCreateModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Agent Blueprints</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Blueprint
        </button>
      </div>

      {blueprints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <DocumentDuplicateIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No blueprints yet</h3>
          <p className="text-gray-500 mt-2">Create a blueprint from one of your agents to start selling clones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((bp: any) => (
            <div key={bp.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-2">{bp.name}</h3>
              <p className="text-gray-600 mb-4">{bp.description}</p>
              <p className="text-sm text-gray-500 mb-2">Type: {bp.agentType}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">${bp.price}</span>
                <span className="text-sm text-gray-500">Royalty: {bp.royaltyRate * 100}%</span>
              </div>
              <p className="text-sm text-gray-500">Clones sold: {bp.clones?.length || 0}</p>
              {bp.clones?.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">
                  Buyers: {bp.clones.map((c: any) => c.buyer.name).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Agent Blueprint</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block mb-1">Source Agent</label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  required
                >
                  <option value="">Select an agent</option>
                  {agents.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.name} ({a.agentType})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Blueprint Name</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={blueprintName}
                  onChange={(e) => setBlueprintName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  className="w-full border rounded p-2"
                  value={blueprintDesc}
                  onChange={(e) => setBlueprintDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Price ($)</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Royalty (%)</label>
                  <input
                    type="number"
                    className="w-full border rounded p-2"
                    value={royaltyRate}
                    onChange={(e) => setRoyaltyRate(parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
