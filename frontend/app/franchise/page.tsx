'use client';

import { useEffect, useState } from 'react';
import axios from '../../lib/axios';
import Link from 'next/link';

export default function FranchisePage() {
  const [blueprints, setBlueprints] = useState([]);

  useEffect(() => {
    fetchBlueprints();
  }, []);

  const fetchBlueprints = async () => {
    try {
      const res = await axios.get('/franchise/blueprints');
      setBlueprints(res.data);
    } catch (error) {
      console.error('Failed to fetch blueprints', error);
      setBlueprints([]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Agent Blueprints Marketplace</h1>
      <Link href="/franchise/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4 inline-block">
        + Create Blueprint
      </Link>

      <h2 className="text-2xl font-semibold mb-4">Available Blueprints</h2>
      {blueprints.length === 0 ? (
        <p>No blueprints available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blueprints.map((bp: any) => (
            <div key={bp.id} className="border rounded p-4">
              <h3 className="text-xl font-semibold">{bp.name}</h3>
              <p className="text-gray-600 mb-2">{bp.description}</p>
              <p><strong>Agent Type:</strong> {bp.agentType}</p>
              <p><strong>Price:</strong> {bp.price} $AGENT</p>
              <p><strong>Royalty:</strong> {bp.royaltyRate}%</p>
              <Link href={`/franchise/blueprint/${bp.id}`} className="text-blue-600 hover:underline">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
