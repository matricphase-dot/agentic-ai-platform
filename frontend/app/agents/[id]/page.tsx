'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { agentsApi, marketplaceApi, businessApi } from '@/lib/api';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  CpuChipIcon,
  StarIcon,
  CurrencyDollarIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function AgentDetailPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  
  const [agent, setAgent] = useState<any>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStakeModal, setShowStakeModal] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(100);
  const [selectedBusinessId, setSelectedBusinessId] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchAgentDetails();
    fetchBusinesses();
  }, [user, agentId]);

  const fetchAgentDetails = async () => {
    try {
      const res = await agentsApi.getAll();
      const found = res.data.agents.find((a: any) => a.id === agentId);
      if (found) {
        setAgent(found);
      } else {
        alert('Agent not found');
        router.push('/agents');
      }
    } catch (error) {
      console.error('Failed to fetch agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await businessApi.getAll();
      setBusinesses(res.data.businesses);
    } catch (error) {
      console.error('Failed to fetch businesses:', error);
    }
  };

  const handleStake = async () => {
    try {
      await marketplaceApi.stakeOnAgent(agentId, stakeAmount);
      alert(`Staked $${stakeAmount} on ${agent.name}`);
      setShowStakeModal(false);
      fetchAgentDetails(); // refresh to show updated reputation/earnings
    } catch (err: any) {
      alert('Stake failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleHire = async () => {
    if (!selectedBusinessId) return;
    try {
      await marketplaceApi.hireAgent(agentId, selectedBusinessId, { role: 'general' });
      alert(`Hired ${agent.name}`);
      setShowHireModal(false);
      fetchAgentDetails(); // status may change to WORKING
    } catch (err: any) {
      alert('Hire failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IDLE': return 'bg-yellow-100 text-yellow-800';
      case 'WORKING': return 'bg-green-100 text-green-800';
      case 'TRAINING': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-purple-100 text-purple-800';
      case 'TERMINATED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WORKING': return <CheckCircleIcon className="h-4 w-4" />;
      case 'IDLE': return <ClockIcon className="h-4 w-4" />;
      case 'TERMINATED': return <XCircleIcon className="h-4 w-4" />;
      default: return <CpuChipIcon className="h-4 w-4" />;
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading agent details...</div>;
  if (!agent) return <div className="p-8 text-center">Agent not found</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
            <p className="text-gray-600">{agent.description || 'No description'}</p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(agent.status)}`}>
            <span className="mr-1">{getStatusIcon(agent.status)}</span>
            {agent.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-xl font-bold">{agent.agentType}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Reputation</p>
            <p className="text-xl font-bold flex items-center">
              <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
              {agent.reputationScore}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Hourly Rate</p>
            <p className="text-xl font-bold">${agent.hourlyRate}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Earnings</p>
            <p className="text-xl font-bold">${agent.totalEarnings}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Tasks Completed</p>
            <p className="text-xl font-bold">{agent.tasksCompleted}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <p className="text-xs text-gray-500">Value Created</p>
            <p className="text-xl font-bold">${agent.totalValueCreated}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowStakeModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Stake on this Agent
          </button>
          {agent.status === 'IDLE' && (
            <button
              onClick={() => setShowHireModal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Hire Agent
            </button>
          )}
          <Link
            href={`/agents/${agentId}/edit`}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Stake Modal */}
      {showStakeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Stake on {agent.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(parseFloat(e.target.value))}
                min="1"
              />
            </div>
            <p className="text-sm text-gray-500 mb-4">Your balance: ${user?.balance}</p>
            <div className="flex gap-2">
              <button
                onClick={handleStake}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowStakeModal(false)}
                className="flex-1 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hire Modal */}
      {showHireModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Hire {agent.name}</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Business</label>
              <select
                className="w-full border rounded p-2"
                value={selectedBusinessId}
                onChange={(e) => setSelectedBusinessId(e.target.value)}
              >
                <option value="">Choose a business</option>
                {businesses.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleHire}
                className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                disabled={!selectedBusinessId}
              >
                Hire
              </button>
              <button
                onClick={() => setShowHireModal(false)}
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
