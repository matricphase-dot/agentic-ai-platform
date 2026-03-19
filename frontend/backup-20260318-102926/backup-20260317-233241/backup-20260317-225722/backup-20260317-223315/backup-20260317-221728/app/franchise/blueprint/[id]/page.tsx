'use client';

import { useEffect, useState } from 'react';
import axios from '../../../../lib/axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BlueprintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (id) fetchBlueprint();
  }, [id]);

  const fetchBlueprint = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/franchise/blueprints/${id}`);
      setBlueprint(res.data);
    } catch (error) {
      console.error('Failed to fetch blueprint', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!confirm('Confirm purchase? This will deduct tokens from your balance.')) return;
    setPurchasing(true);
    try {
      await axios.post('/franchise/purchase', { blueprintId: id });
      alert('Franchise purchased! A new agent has been created.');
      router.push('/franchise/my');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!blueprint) return <div className="p-8">Blueprint not found</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/franchise" className="text-blue-600 hover:underline">← Back to Marketplace</Link>
      <h1 className="text-3xl font-bold mt-4">{blueprint.name}</h1>
      <div className="border rounded p-4 my-4">
        <p><strong>Creator:</strong> {blueprint.creator?.name}</p>
        <p><strong>Description:</strong> {blueprint.description}</p>
        <p><strong>Agent Type:</strong> {blueprint.agentType}</p>
        <p><strong>Price:</strong> {blueprint.price} $AGENT</p>
        <p><strong>Royalty Rate:</strong> {blueprint.royaltyRate}%</p>
      </div>
      <button
        onClick={handlePurchase}
        disabled={purchasing}
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
      >
        {purchasing ? 'Processing...' : 'Purchase Franchise'}
      </button>
    </div>
  );
}

