'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';

export default function ProposalDetailPage() {
  const { id } = useParams();
  const [proposal, setProposal] = useState<any>(null);
  const [tally, setTally] = useState<any>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProposal();
      fetchTally();
    }
  }, [id]);

  const fetchProposal = async () => {
    try {
      const res = await axios.get(`/api/governance/proposals`);
      const found = res.data.find((p: any) => p.id === id);
      setProposal(found);
    } catch (error) {
      console.error('Failed to fetch proposal', error);
    }
  };

  const fetchTally = async () => {
    try {
      const res = await axios.get(`/api/governance/proposals/${id}/tally`);
      setTally(res.data);
    } catch (error) {
      console.error('Failed to fetch tally', error);
    }
  };

  const handleVote = async (support: boolean) => {
    try {
      await axios.post(`/api/governance/proposals/${id}/vote`, { support });
      alert('Vote cast!');
      setHasVoted(true);
      fetchTally();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to vote');
    }
  };

  if (!proposal) return <div>Loading...</div>;

  const isActive = proposal.status === 'active' && new Date(proposal.votingEnds) > new Date();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{proposal.title}</h1>
      <p className="text-gray-600 mb-4">Proposed by: {proposal.proposer?.name || 'Unknown'}</p>
      <p className="whitespace-pre-wrap mb-6">{proposal.description}</p>
      <p className="mb-2">
        Status: <span className="font-semibold">{proposal.status}</span>
      </p>
      <p className="mb-4">Voting ends: {new Date(proposal.votingEnds).toLocaleString()}</p>

      {isActive && !hasVoted && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Cast Your Vote</h2>
          <div className="flex gap-4">
            <button
              onClick={() => handleVote(true)}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              For
            </button>
            <button
              onClick={() => handleVote(false)}
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              Against
            </button>
          </div>
        </div>
      )}

      {tally && (
        <div className="mt-8 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <div className="flex gap-8">
            <div>
              <p className="text-green-600 font-bold">For: {tally.for.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-red-600 font-bold">Against: {tally.against.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}