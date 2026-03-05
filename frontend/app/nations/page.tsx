'use client';

import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import Link from 'next/link';

export default function NationsPage() {
  const [nations, setNations] = useState([]);

  useEffect(() => {
    fetchNations();
  }, []);

  const fetchNations = async () => {
    try {
      const res = await axios.get('/nation');
      setNations(res.data);
    } catch (error) {
      console.error('Failed to fetch nations', error);
      setNations([]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Digital Nations</h1>
      <Link href="/nations/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 inline-block">
        + Create Nation
      </Link>

      {nations.length === 0 ? (
        <p>No nations yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nations.map((nation: any) => (
            <div key={nation.id} className="border rounded p-4">
              <h2 className="text-xl font-semibold">{nation.name}</h2>
              <p className="text-gray-600 mb-2">{nation.description}</p>
              <p><strong>Founder:</strong> {nation.founder?.name}</p>
              <p><strong>Citizens:</strong> {nation.citizens?.length || 0}</p>
              <Link href={`/nations/${nation.id}`} className="text-blue-600 hover:underline">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
