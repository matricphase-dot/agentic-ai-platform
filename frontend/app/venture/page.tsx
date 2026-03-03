'use client';

import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import Link from 'next/link';

export default function VenturePage() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await axios.get('/venture/proposals');
      setProposals(res.data);
    } catch (error) {
      console.error('Failed to fetch proposals', error);
      setProposals([]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">AI Venture Capital</h1>
      <Link href="/venture/submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 inline-block">
        Submit a Proposal
      </Link>

      <h2 className="text-2xl font-semibold mb-4">Investment Proposals</h2>
      {proposals.length === 0 ? (
        <p>No proposals yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>Startup</th>
              <th>Title</th>
              <th>Ask Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {proposals.map((p: any) => (
              <tr key={p.id}>
                <td>{p.startup?.name || 'N/A'}</td>
                <td>{p.title}</td>
                <td>{p.askAmount} $AGENT</td>
                <td>
                  <span className={`px-2 py-1 rounded ${
                    p.status === 'funded' ? 'bg-green-200 text-green-800' :
                    p.status === 'approved' ? 'bg-blue-200 text-blue-800' :
                    p.status === 'rejected' ? 'bg-red-200 text-red-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <Link href={`/venture/proposal/${p.id}`} className="text-blue-600 hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

