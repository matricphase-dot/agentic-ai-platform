'use client';

import { useState } from 'react';
import axios from '../../../../../lib/axios';
import { useParams, useRouter } from 'next/navigation';

export default function NewProposalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', description: '', votingDays: 7 });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`/nation/${id}/proposals`, form);
      alert('Proposal created!');
      router.push(`/nations/${id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create proposal');
    } finally {
      setSubmitting(false);
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
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
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
            value={form.votingDays}
            onChange={(e) => setForm({ ...form, votingDays: parseInt(e.target.value) })}
            className="border p-2 w-24"
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {submitting ? 'Creating...' : 'Create Proposal'}
        </button>
      </form>
    </div>
  );
}
