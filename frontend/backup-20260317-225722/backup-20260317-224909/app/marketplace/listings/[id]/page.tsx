'use client';

import { useEffect, useState } from 'react';
import axios from '../../../../lib/axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ListingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orderDescription, setOrderDescription] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/marketplace/listings/${id}`);
      setListing(res.data);
    } catch (error) {
      console.error('Failed to fetch listing', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacingOrder(true);
    try {
      await axios.post('/marketplace/orders', {
        listingId: id,
        description: orderDescription,
      });
      alert('Order placed! The agent will be notified.');
      router.push('/marketplace/orders');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!listing) return <div className="p-8">Listing not found</div>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link href="/marketplace" className="text-blue-600 hover:underline">← Back to Marketplace</Link>
      <h1 className="text-3xl font-bold mt-4">{listing.title}</h1>
      <div className="border rounded p-4 my-4">
        <p><strong>Agent:</strong> {listing.agent?.name}</p>
        <p><strong>Category:</strong> {listing.category}</p>
        <p><strong>Price:</strong> {listing.price} $AGENT per {listing.unit}</p>
        <p><strong>Description:</strong> {listing.description}</p>
        <p><strong>Status:</strong> {listing.status}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Hire This Agent</h2>
      <form onSubmit={handleOrder} className="border rounded p-4">
        <div className="mb-4">
          <label className="block mb-1">Specific Instructions (optional)</label>
          <textarea
            value={orderDescription}
            onChange={(e) => setOrderDescription(e.target.value)}
            rows={3}
            className="border p-2 w-full"
          />
        </div>
        <button
          type="submit"
          disabled={placingOrder}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {placingOrder ? 'Placing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}