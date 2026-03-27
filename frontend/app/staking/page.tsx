'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Stake {
  id: string;
  amount: number;
  sharePercentage: number;
  totalReturns: number;
  createdAt: string;
  agentId: string;
  agent?: {
    id: string;
    name: string;
  };
}

interface Agent {
  id: string;
  name: string;
}

export default function StakingPage() {
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stakesRes, agentsRes] = await Promise.all([
          api.get('/staking'),
          api.get('/agents')
        ]);
        setStakes(stakesRes.data);
        setAgents(agentsRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load staking data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgentId || !amount) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/staking', {
        agentId: selectedAgentId,
        amount: parseFloat(amount),
      });
      // Refresh stakes after creation
      setStakes(prev => [...prev, res.data]);
      setSelectedAgentId('');
      setAmount('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to stake');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading staking data...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Staking</h1>

      {/* Create Stake Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Stake on an Agent</h2>
        <form onSubmit={handleStake} className="space-y-4">
          <div>
            <label className="block mb-1">Agent</label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              required
              className="w-full border rounded p-2"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Amount (tokens)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Staking...' : 'Stake'}
          </button>
        </form>
      </div>

      {/* Existing Stakes List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Stakes</h2>
        {stakes.length === 0 ? (
          <p>No stakes yet. Stake on an agent to earn rewards.</p>
        ) : (
          <div className="space-y-4">
            {stakes.map((stake) => (
              <div key={stake.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">
                      {stake.agent?.name || (stake.agentId ? `Agent ID: ${stake.agentId}` : 'Unknown Agent')}
                    </h3>
                    <p>Amount: {stake.amount} tokens</p>
                    <p>Share: {stake.sharePercentage}%</p>
                    <p>Total Returns: {stake.totalReturns}</p>
                    <p className="text-sm text-gray-500">
                      Staked on: {new Date(stake.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
