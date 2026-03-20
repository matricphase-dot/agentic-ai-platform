'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export default function BusinessesPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [revenueAmount, setRevenueAmount] = useState(100);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchBusinesses();
  }, [user]);

  const fetchBusinesses = async () => {
    try {
      const res = await api.get(`/businesses`);
      setBusinesses(res.data);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordRevenue = async () => {
    if (!selectedBusiness) return;
    try {
      await api.post(`/businesses/${selectedBusiness.id}/revenue`, { amount: revenueAmount, description: "Manual entry" });
      alert(`Recorded $${revenueAmount} revenue for ${selectedBusiness.name}`);
      setShowRevenueModal(false);
      fetchBusinesses(); // refresh
    } catch (err: any) {
      alert('Failed to record revenue: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading businesses...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Businesses</h1>
        <Link
          href="/launch"
          className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Launch New Business
        </Link>
      </div>

      {businesses.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No businesses yet</h3>
          <p className="text-gray-500 mt-2">Launch your first autonomous business to get started.</p>
          <Link
            href="/launch"
            className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Launch Business
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business: any) => (
            <div key={business.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{business.description}</p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="text-lg font-bold">${business.revenue}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Profit</p>
                    <p className="text-lg font-bold">${business.profit}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">MRR</p>
                    <p className="text-lg font-bold">${business.monthlyRecurringRevenue}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Agents</p>
                    <p className="text-lg font-bold">{business.agents?.length || 0}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedBusiness(business);
                      setShowRevenueModal(true);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    Record Revenue
                  </button>
                  <Link
                    href={`/businesses/${business.id}`}
                    className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 text-center"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Modal */}
      {showRevenueModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Record Revenue for {selectedBusiness.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={revenueAmount}
                onChange={(e) => setRevenueAmount(parseFloat(e.target.value))}
                min="1"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Note: 15% will be automatically distributed to hired agents.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRecordRevenue}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Record
              </button>
              <button
                onClick={() => setShowRevenueModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




