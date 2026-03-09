'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function StakingPage() {
  const { user } = useAuth();
  const [stakes, setStakes] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [amount, setAmount] = useState('');
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStakes();
    fetchLeaderboard();
    fetchAgents();
  }, []);

  const fetchStakes = async () => {
    try {
      const res = await axios.get('/api/staking');
      setStakes(res.data);
    } catch (error) {
      console.error('Failed to fetch stakes', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get('/api/staking/leaderboard');
      setLeaderboard(res.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axios.get('/api/agents');
      setAgents(res.data);
    } catch (error) {
      console.error('Failed to fetch agents', error);
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !amount) return;
    try {
      await axios.post('/api/staking/stake', {
        agentId: selectedAgent,
        amount: parseFloat(amount)
      });
      setSelectedAgent('');
      setAmount('');
      fetchStakes();
      fetchLeaderboard();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to stake');
    }
  };

  const handleUnstake = async (stakeId: string) => {
    if (!confirm('Are you sure you want to unstake? You will stop earning rewards.')) return;
    try {
      await axios.post(`/api/staking/unstake/${stakeId}`);
      fetchStakes();
      fetchLeaderboard();
    } catch (error) {
      alert('Failed to unstake');
    }
  };

  const handleClaim = async (stakeId: string) => {
    setClaimingId(stakeId);
    try {
      await axios.post('/api/staking/claim', { stakeId });
      fetchStakes();
      alert('Rewards claimed!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to claim');
    } finally {
      setClaimingId(null);
    }
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Staking</h1>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Stake on an Agent</h2>
          <form onSubmit={handleStake}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Agent</label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="border p-2 w-full rounded"
                required
              >
                <option value="">-- Choose an agent --</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.revenueShare ? `(${a.revenueShare}% rev share)` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount ($AGENT)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border p-2 w-full rounded"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Stake
            </button>
          </form>
        </div>

        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Top Staked Agents</h2>
          {leaderboard.length === 0 ? (
            <p className="text-gray-500">No stakes yet.</p>
          ) : (
            <ul className="space-y-2">
              {leaderboard.map((entry, idx) => (
                <li key={entry.agentId} className="flex justify-between border-b pb-1">
                  <span>{idx+1}. {entry.agent?.name || 'Unknown'}</span>
                  <span className="font-semibold">{entry._sum.amount} $AGENT</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Your Stakes</h2>
      {stakes.length === 0 ? (
        <p className="text-gray-500">You haven't staked on any agents yet.</p>
      ) : (
        <div className="grid gap-4">
          {stakes.map(stake => {
            const totalRewards = stake.rewards?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0;
            return (
              <div key={stake.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="font-semibold text-lg">{stake.agent?.name}</h3>
                  <p className="text-sm text-gray-600">Staked: {stake.amount} $AGENT</p>
                  <p className="text-sm">Status: <span className={stake.status === 'active' ? 'text-green-600' : 'text-gray-500'}>{stake.status}</span></p>
                  <p className="text-sm">Rewards earned: {totalRewards.toFixed(2)} $AGENT</p>
                  <p className="text-xs text-gray-400">Staked on {formatDate(stake.createdAt)}</p>
                </div>
                {stake.status === 'active' && (
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => handleClaim(stake.id)}
                      disabled={claimingId === stake.id}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {claimingId === stake.id ? 'Claiming...' : 'Claim Rewards'}
                    </button>
                    <button
                      onClick={() => handleUnstake(stake.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Unstake
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
