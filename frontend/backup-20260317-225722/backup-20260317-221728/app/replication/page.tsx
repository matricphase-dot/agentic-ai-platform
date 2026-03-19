'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';

export default function ReplicationMarketplace() {
  const { user } = useAuth();
  const router = useRouter();
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchBlueprints();
  }, [user]);

  const fetchBlueprints = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/replication/blueprints`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setBlueprints(data.blueprints);
    } catch (error) {
      console.error('Failed to fetch blueprints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClone = async (blueprintId: string) => {
    if (!confirm('Clone this agent? Funds will be deducted from your balance.')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/replication/blueprints/${blueprintId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Agent cloned! Your new agent ID: ${data.agent.id}`);
        router.push('/agents');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading blueprints...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Agent Franchise Marketplace</h1>
      <p className="text-gray-600 mb-8">Clone successful agents and start using them immediately. Royalties are automatically paid to the original creator.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blueprints.map((bp: any) => (
          <div key={bp.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{bp.name}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{bp.description}</p>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">Type: {bp.agentType}</span>
                <span className="text-sm text-gray-500">By: {bp.owner.name}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">${bp.price}</span>
                <span className="text-sm text-gray-500">Royalty: {bp.royaltyRate * 100}%</span>
              </div>
              <button
                onClick={() => handleClone(bp.id)}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                disabled={user.id === bp.owner.id} // can't clone own
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Clone Agent
              </button>
            </div>
          </div>
        ))}
      </div>
      {blueprints.length === 0 && (
        <p className="text-center text-gray-500">No agent blueprints available yet.</p>
      )}
    </div>
  );
}
