'use client';

import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function NationDetailPage() {
  const { id } = useParams();
  const [nation, setNation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchNation();
  }, [id]);

  const fetchNation = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/nation/${id}`);
      setNation(res.data);
    } catch (error) {
      console.error('Failed to fetch nation', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    try {
      await axios.post(`/nation/${id}/join`);
      alert('Joined nation!');
      fetchNation();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join');
    }
  };

  const handleLeave = async () => {
    try {
      await axios.post(`/nation/${id}/leave`);
      alert('Left nation');
      fetchNation();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to leave');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!nation) return <div className="p-8">Nation not found</div>;

  const isFounder = nation.founder?.id === localStorage.getItem('userId'); // You'd need to store userId

  return (
    <div className="p-8">
      <Link href="/nations" className="text-blue-600 hover:underline">← Back to Nations</Link>
      <h1 className="text-3xl font-bold mt-4">{nation.name}</h1>
      <p className="text-gray-700 mb-4">{nation.description}</p>
      <div className="flex gap-2 mb-4">
        <button onClick={handleJoin} className="bg-green-600 text-white px-3 py-1 rounded">Join</button>
        <button onClick={handleLeave} className="bg-red-600 text-white px-3 py-1 rounded">Leave</button>
      </div>
      <div className="border rounded p-4 mb-4">
        <p><strong>Founder:</strong> {nation.founder?.name}</p>
        <p><strong>Citizens:</strong> {nation.citizens?.length}</p>
        <p><strong>Treasury:</strong> {nation.treasury} $AGENT</p>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Citizens</h2>
      <ul className="list-disc pl-5 mb-4">
        {nation.citizens?.map((c: any) => (
          <li key={c.id}>{c.user?.name} ({c.role})</li>
        ))}
      </ul>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-semibold">Active Proposals</h2>
        <Link href={`/nations/${id}/proposals/new`} className="bg-blue-600 text-white px-3 py-1 rounded">
          + New Proposal
        </Link>
      </div>
      {nation.proposals?.length === 0 ? (
        <p>No active proposals.</p>
      ) : (
        <ul>
          {nation.proposals.map((p: any) => (
            <li key={p.id}>
              <Link href={`/nations/${id}/proposals/${p.id}`} className="text-blue-600 hover:underline">
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
