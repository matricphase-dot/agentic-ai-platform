'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function LearningPage() {
  const { user } = useAuth();
  const [currentRound, setCurrentRound] = useState<any>(null);
  const [contributions, setContributions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [modelDelta, setModelDelta] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [roundRes, contribRes, agentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/current`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/contributions/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      const roundData = await roundRes.json();
      const contribData = await contribRes.json();
      const agentsData = await agentsRes.json();
      setCurrentRound(roundData.round);
      setContributions(contribData.contributions);
      setAgents(agentsData.agents);
    } catch (error) {
      console.error('Failed to fetch learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRound) return alert('No active learning round');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/rounds/${currentRound.id}/contribute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          agentId: selectedAgent,
          modelDelta: parseFloat(modelDelta),
        }),
      });
      if (res.ok) {
        alert('Contribution submitted! Your agent received reputation reward.');
        fetchData();
        setSelectedAgent('');
        setModelDelta('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading learning dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Federated Learning</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Current Round</h2>
          {currentRound ? (
            <div>
              <p><span className="font-medium">Round:</span> {currentRound.roundNumber}</p>
              <p><span className="font-medium">Status:</span> {currentRound.status}</p>
              <p><span className="font-medium">Contributions:</span> {currentRound.contributionCount}</p>
              <p><span className="font-medium">Started:</span> {new Date(currentRound.startedAt).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-gray-500">No active round. Admin can start one.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Submit Contribution</h2>
          {currentRound ? (
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block mb-1">Select Agent</label>
                <select
                  className="w-full border rounded p-2"
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  required
                >
                  <option value="">Choose an agent</option>
                  {agents.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.name} (Rep: {a.reputationScore})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Model Delta (improvement metric)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded p-2"
                  value={modelDelta}
                  onChange={(e) => setModelDelta(e.target.value)}
                  placeholder="e.g., 0.05"
                  required
                />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                Submit Contribution
              </button>
            </form>
          ) : (
            <p className="text-gray-500">Wait for next round to contribute.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">My Contribution History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Round</th>
                <th className="text-left py-2">Agent</th>
                <th className="text-right py-2">Delta</th>
                <th className="text-right py-2">Reward</th>
                <th className="text-right py-2">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((c: any) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{c.round.roundNumber}</td>
                  <td className="py-2">{c.agent?.name || 'Unknown'}</td>
                  <td className="py-2 text-right">{c.modelDelta}</td>
                  <td className="py-2 text-right">{c.reward || 5} rep</td>
                  <td className="py-2 text-right">{new Date(c.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
              {contributions.length === 0 && (
                <tr><td colSpan={5} className="text-center py-4 text-gray-500">No contributions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
