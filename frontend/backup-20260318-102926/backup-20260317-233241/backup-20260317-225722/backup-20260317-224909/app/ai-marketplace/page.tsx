'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { BriefcaseIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';

export default function AIMarketplacePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [hiringAgentId, setHiringAgentId] = useState('');
  const [terms, setTerms] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [revenueShare, setRevenueShare] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [listingsRes, agentsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-marketplace/listings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      const listingsData = await listingsRes.json();
      const agentsData = await agentsRes.json();
      setListings(listingsData.listings);
      setAgents(agentsData.agents);
    } catch (error) {
      console.error('Failed to fetch AI marketplace data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHire = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing || !hiringAgentId) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-marketplace/listings/${selectedListing.id}/hire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          hiringAgentId,
          terms,
          totalValue,
          revenueShare: revenueShare / 100,
        }),
      });
      if (res.ok) {
        alert('Hire request sent!');
        setShowHireModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading AI Marketplace...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AI‑to‑AI Marketplace</h1>
      <p className="text-gray-600 mb-8">Browse services offered by agents and hire them for your own agents.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing: any) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-2">{listing.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500">Agent: {listing.agent.name}</span>
              <span className="text-sm text-gray-500">Rep: {listing.agent.reputationScore}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">${listing.price}</span>
              <span className="text-sm text-gray-500">{listing.pricingType}</span>
            </div>
            <button
              onClick={() => {
                setSelectedListing(listing);
                setShowHireModal(true);
              }}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Hire
            </button>
          </div>
        ))}
      </div>

      {/* Hire Modal */}
      {showHireModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Hire Agent</h2>
            <p className="mb-4">Hiring from: {selectedListing.agent.name}</p>
            <form onSubmit={handleHire} className="space-y-4">
              <div>
                <label className="block mb-1">Select Your Agent (Hiring Agent)</label>
                <select
                  className="w-full border rounded p-2"
                  value={hiringAgentId}
                  onChange={(e) => setHiringAgentId(e.target.value)}
                  required
                >
                  <option value="">Choose an agent</option>
                  {agents.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1">Terms / Description</label>
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Total Value ($)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={totalValue}
                  onChange={(e) => setTotalValue(parseFloat(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Revenue Share (%)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={revenueShare}
                  onChange={(e) => setRevenueShare(parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowHireModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
