'use client';

import { useEffect, useState } from 'react';
import axios from '../../../../../lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ProposalDetailPage() {
  const { id, proposalId } = useParams();
  const [proposal, setProposal] = useState<any>(null);
  const [tally, setTally] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (proposalId) fetchData();
  }, [proposalId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [proposalRes, tallyRes] = await Promise.all([
        axios.get(`/nation/${id}/proposals`),
        axios.get(`/nation/proposals/${proposalId}/tally`),
      ]);
      const found = proposalRes.data.find((p: any) => p.id === proposalId);
      setProposal(found);
      setTally(tallyRes.data);
    } catch (error) {
      console.error('Failed to fetch proposal', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (support: boolean) => {
    try {
      await axios.post(`/nation/proposals/${proposalId}/vote`, { support });
      alert('Vote cast!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to vote');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!proposal) return <div className="p-8">Proposal not found</div>;

  const isActive = proposal.status === 'active' && new Date(proposal.votingEnds) > new Date();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href={`/nations/${id}`} className="text-blue-600 hover:underline">← Back to Nation</Link>
      <h1 className="text-3xl font-bold mt-4">{proposal.title}</h1>
      <p className="text-gray-600 mb-4">Proposed by: {proposal.proposer?.name}</p>
      <p className="whitespace-pre-wrap mb-4">{proposal.description}</p>
      <p><strong>Status:</strong> {proposal.status}</p>
      <p><strong>Voting ends:</strong> {new Date(proposal.votingEnds).toLocaleString()}</p>

      {isActive && (
        <div className="my-4">
          <button onClick={() => handleVote(true)} className="bg-green-600 text-white px-4 py-2 rounded mr-2">For</button>
          <button onClick={() => handleVote(false)} className="bg-red-600 text-white px-4 py-2 rounded">Against</button>
        </div>
      )}

      {tally && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <p>For: {tally.for}</p>
          <p>Against: {tally.against}</p>
        </div>
      )}
    </div>
  );
}

