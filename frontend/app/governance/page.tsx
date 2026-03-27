'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Proposal {
  id: string;
  title: string;
  description: string;
  options: string[];
  endDate: string;
  status: string;
  votes: Array<{ option: string; weight: number }>;
  userVote?: string; // track if the current user has voted
}

export default function GovernancePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await api.get('/governance');
        setProposals(res.data);
      } catch (err) {
        console.error('Failed to fetch proposals', err);
        setError('Failed to load proposals');
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleVote = async (proposalId: string, option: string) => {
    setVoting(proposalId);
    setError('');
    try {
      await api.post(`/governance/${proposalId}/vote`, { option });
      // Refresh proposals to show updated vote status
      const res = await api.get('/governance');
      setProposals(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  if (loading) return <div>Loading governance proposals...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Governance</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {proposals.length === 0 ? (
        <p>No active proposals. Check back later.</p>
      ) : (
        <div className="space-y-6">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-2">{proposal.title}</h2>
              <p className="text-gray-600 mb-3">{proposal.description}</p>
              <div className="text-sm text-gray-500 mb-3">
                Status: <span className="capitalize">{proposal.status}</span> | 
                Ends: {new Date(proposal.endDate).toLocaleString()}
              </div>
              {proposal.status === 'active' && !proposal.userVote ? (
                <div className="flex space-x-3">
                  {proposal.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleVote(proposal.id, opt)}
                      disabled={voting === proposal.id}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                      {voting === proposal.id ? 'Voting...' : `Vote ${opt}`}
                    </button>
                  ))}
                </div>
              ) : proposal.userVote ? (
                <p className="text-green-600">You voted: {proposal.userVote}</p>
              ) : proposal.status !== 'active' ? (
                <p className="text-gray-500">This proposal is closed.</p>
              ) : null}
              {proposal.votes && proposal.votes.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium">Current results:</p>
                  <ul className="list-disc list-inside text-sm">
                    {proposal.votes.map((vote) => (
                      <li key={vote.option}>{vote.option}: {vote.weight} votes</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
