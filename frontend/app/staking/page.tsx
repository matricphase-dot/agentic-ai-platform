"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Coins, TrendingUp, Award, Loader2, ArrowUpCircle, ArrowDownCircle, Gift } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
}

interface Reward {
  id: string;
  amount: number;
  createdAt: string;
}

interface Stake {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  lastRewardClaim: string | null;
  pendingRewards: number;
  agent: Agent;
  rewards: Reward[];
}

interface LeaderboardEntry {
  agent: Agent;
  totalStaked: number;
}

export default function StakingPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [myStakes, setMyStakes] = useState<Stake[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stakeAmount, setStakeAmount] = useState<{ [key: string]: string }>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [agentsRes, stakesRes, leaderboardRes] = await Promise.all([
        api.get('/agents'),
        api.get('/staking/my-stakes'),
        api.get('/staking/leaderboard')
      ]);
      setAgents(agentsRes.data);
      setMyStakes(stakesRes.data);
      setLeaderboard(leaderboardRes.data);

      // Calculate total earned from rewards
      const total = stakesRes.data.reduce((acc: number, stake: Stake) => {
        return acc + (stake.rewards?.reduce((sum: number, r: Reward) => sum + r.amount, 0) || 0);
      }, 0);
      setTotalEarned(total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStake = async (agentId: string) => {
    const amount = parseFloat(stakeAmount[agentId]);
    if (!amount || amount <= 0) return;

    setProcessing(agentId);
    try {
      await api.post('/staking/stake', { agentId, amount });
      setStakeAmount({ ...stakeAmount, [agentId]: '' });
      await fetchData();
    } catch (error) {
      console.error('Stake failed:', error);
      alert('Failed to stake');
    } finally {
      setProcessing(null);
    }
  };

  const handleUnstake = async (agentId: string) => {
    if (!confirm('Unstake all tokens from this agent?')) return;
    setProcessing(agentId);
    try {
      await api.post(`/staking/unstake/${agentId}`);
      await fetchData();
    } catch (error) {
      console.error('Unstake failed:', error);
      alert('Failed to unstake');
    } finally {
      setProcessing(null);
    }
  };

  const handleClaim = async (stakeId: string) => {
    setProcessing(stakeId);
    try {
      const res = await api.post(`/staking/claim/${stakeId}`);
      alert(`Claimed ${res.data.claimedAmount} AGIX rewards!`);
      await fetchData();
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Failed to claim rewards');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Staking & Rewards</h1>
      <p className="text-gray-600 mb-8">Stake AGIX tokens on agents and earn daily rewards (1% per day).</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Coins className="w-5 h-5" />
            <span className="text-sm font-medium">Total Staked</span>
          </div>
          <div className="text-2xl font-bold">
            {myStakes.reduce((sum, s) => sum + (s.status === 'active' ? s.amount : 0), 0)} AGIX
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Gift className="w-5 h-5" />
            <span className="text-sm font-medium">Total Earned</span>
          </div>
          <div className="text-2xl font-bold">{totalEarned} AGIX</div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Pending Rewards</span>
          </div>
          <div className="text-2xl font-bold">
            {myStakes.reduce((sum, s) => sum + (s.pendingRewards || 0), 0).toFixed(2)} AGIX
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Agent list with stake forms */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Agents</h2>
          <div className="space-y-4">
            {agents.map(agent => {
              const myStake = myStakes.find(s => s.agent.id === agent.id && s.status === 'active');
              return (
                <div key={agent.id} className="border rounded-lg p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-lg">{agent.name}</h3>
                      <p className="text-sm text-gray-600">{agent.description}</p>
                    </div>
                    {myStake && (
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {myStake.amount} staked
                      </div>
                    )}
                  </div>
                  {myStake && myStake.pendingRewards > 0 && (
                    <div className="mb-2 text-sm text-yellow-600">
                      Pending rewards: {myStake.pendingRewards.toFixed(2)} AGIX
                    </div>
                  )}
                  <div className="flex gap-2 items-center flex-wrap">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="Amount"
                      className="flex-1 min-w-[120px] border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={stakeAmount[agent.id] || ''}
                      onChange={(e) => setStakeAmount({ ...stakeAmount, [agent.id]: e.target.value })}
                      disabled={processing === agent.id}
                    />
                    <button
                      onClick={() => handleStake(agent.id)}
                      disabled={processing === agent.id || !stakeAmount[agent.id]}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-1"
                    >
                      {processing === agent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpCircle className="w-4 h-4" />}
                      Stake
                    </button>
                    {myStake && (
                      <>
                        <button
                          onClick={() => handleUnstake(agent.id)}
                          disabled={processing === agent.id}
                          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
                        >
                          <ArrowDownCircle className="w-4 h-4" />
                          Unstake
                        </button>
                        {myStake.pendingRewards > 0 && (
                          <button
                            onClick={() => handleClaim(myStake.id)}
                            disabled={processing === myStake.id}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-1"
                          >
                            {processing === myStake.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                            Claim
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Leaderboard and My Stakes */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Leaderboard
            </h2>
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-sm">No stakes yet.</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, idx) => (
                  <div key={entry.agent.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-500 w-6 text-right">{idx+1}.</span>
                      <span>{entry.agent.name}</span>
                    </div>
                    <span className="font-medium text-green-600">{entry.totalStaked} AGIX</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border p-4">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              My Stakes
            </h2>
            {myStakes.filter(s => s.status === 'active').length === 0 ? (
              <p className="text-gray-500 text-sm">No active stakes.</p>
            ) : (
              <div className="space-y-3">
                {myStakes.filter(s => s.status === 'active').map(stake => (
                  <div key={stake.id} className="p-3 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{stake.agent.name}</div>
                      <span className="text-sm text-green-600">{stake.amount} AGIX</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="text-gray-500">Pending: {stake.pendingRewards?.toFixed(2) || 0} AGIX</span>
                      {stake.pendingRewards > 0 && (
                        <button
                          onClick={() => handleClaim(stake.id)}
                          disabled={processing === stake.id}
                          className="text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-1"
                        >
                          {processing === stake.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gift className="w-3 h-3" />}
                          Claim
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}