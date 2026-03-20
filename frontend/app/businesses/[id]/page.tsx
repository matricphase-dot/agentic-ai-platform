'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

export default function BusinessDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;
  
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenueAmount, setRevenueAmount] = useState(100);
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchBusinessDetail();
  }, [user, businessId]);

  const fetchBusinessDetail = async () => {
    try {
      const res = await api.getAll();
      const found = res.data.businesses.find((b: any) => b.id === businessId);
      if (found) {
        setBusiness(found);
        const agentIds = found.agents?.map((a: any) => a.agentId) || [];
        if (agentIds.length > 0) {
          const agentsRes = await api.getAll();
          const hiredAgents = agentsRes.data.agents.filter((a: any) => agentIds.includes(a.id));
          setAgents(hiredAgents);
        }
      } else {
        alert('Business not found');
        router.push('/businesses');
      }
    } catch (error) {
      console.error('Failed to fetch business:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordRevenue = async () => {
    try {
      await api.recordRevenue(businessId, revenueAmount, 'Manual entry');
      alert(`Recorded $${revenueAmount} revenue`);
      setShowRevenueModal(false);
      fetchBusinessDetail();
    } catch (err: any) {
      alert('Failed to record revenue: ' + (err.response?.data?.error || err.message));
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading business details...</div>;
  if (!business) return <div className="p-8 text-center">Business not found</div>;

  return (
    <div className="p-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{business.name}</h1>
        <p className="text-gray-600 mb-6">{business.description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold">${business.revenue}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Profit</p>
            <p className="text-2xl font-bold">${business.profit}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">MRR</p>
            <p className="text-2xl font-bold">${business.monthlyRecurringRevenue}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Agents</p>
            <p className="text-2xl font-bold">{agents.length}</p>
          </div>
        </div>

        <button
          onClick={() => setShowRevenueModal(true)}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Record Revenue
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <UserGroupIcon className="h-5 w-5 mr-2 text-gray-600" />
          Hired Agents
        </h2>
        
        {agents.length === 0 ? (
          <p className="text-gray-500">No agents hired yet. Visit the marketplace to hire some.</p>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center">
                  <CpuChipIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-semibold">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{agent.agentType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">Earnings: ${agent.totalEarnings}</p>
                  <p className="text-xs text-gray-500">Tasks: {agent.tasksCompleted}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showRevenueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Record Revenue</h2>
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
              15% will be distributed to hired agents.
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
