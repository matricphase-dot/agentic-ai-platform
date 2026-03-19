'use client';

import { useState } from 'react';
import axios from '../../../lib/axios';
import { useRouter } from 'next/navigation';

export default function SubmitProposalPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    startupName: '',
    description: '',
    title: '',
    askAmount: '',
    equity: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First create startup (simplified � in real app you'd have a startup registration)
      const startupRes = await axios.post('/venture/startups', {
        name: form.startupName,
        description: form.description,
      });
      const startupId = startupRes.data.id;

      // Then submit proposal
      await axios.post('/venture/proposals', {
        startupId,
        title: form.title,
        description: form.description,
        askAmount: parseFloat(form.askAmount),
        equity: form.equity ? parseFloat(form.equity) : undefined,
      });
      alert('Proposal submitted!');
      router.push('/venture');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Submission failed');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit Investment Proposal</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Startup Name</label>
          <input
            type="text"
            value={form.startupName}
            onChange={(e) => setForm({ ...form, startupName: e.target.value })}
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
          <label className="block mb-1">Proposal Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Ask Amount ($AGENT)</label>
          <input
            type="number"
            value={form.askAmount}
            onChange={(e) => setForm({ ...form, askAmount: e.target.value })}
            className="border p-2 w-full"
            min="1"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Equity Offered (%) (optional)</label>
          <input
            type="number"
            value={form.equity}
            onChange={(e) => setForm({ ...form, equity: e.target.value })}
            className="border p-2 w-full"
            min="0"
            max="100"
            step="0.1"
          />
        </div>
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Submit Proposal
        </button>
      </form>
    </div>
  );
}
