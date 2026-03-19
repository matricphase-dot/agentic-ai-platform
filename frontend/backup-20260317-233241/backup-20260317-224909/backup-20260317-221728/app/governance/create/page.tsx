'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateProposalPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [votingDays, setVotingDays] = useState(7);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/governance/proposals', { title, description, votingDays });
      alert('Proposal created successfully!');
      router.push('/governance');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create proposal');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create Proposal</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Voting Period (days)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={votingDays}
            onChange={(e) => setVotingDays(parseInt(e.target.value))}
            className="border p-2 w-24"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
          Submit Proposal
        </button>
      </form>
    </div>
  );
}
