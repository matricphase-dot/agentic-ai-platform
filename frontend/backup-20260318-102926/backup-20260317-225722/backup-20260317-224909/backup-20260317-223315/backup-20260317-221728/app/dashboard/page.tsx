'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import {
  CpuChipIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
  PuzzlePieceIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  counts: {
    agents: number;
    staked: number;
    proposals: number;
    reviews: number;
    integrations: number;
    auditLogs: number;
    consents: number;
    dataRequests: number;
  };
  recent: {
    stakes: any[];
    proposals: any[];
    reviews: any[];
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Agents', value: stats?.counts.agents || 0, icon: CpuChipIcon, href: '/agents', color: 'indigo' },
    { label: 'Total Staked', value: stats?.counts.staked ? `${stats.counts.staked} AGENT` : '0', icon: CurrencyDollarIcon, href: '/staking', color: 'green' },
    { label: 'Proposals', value: stats?.counts.proposals || 0, icon: ChatBubbleLeftRightIcon, href: '/governance', color: 'purple' },
    { label: 'Reviews', value: stats?.counts.reviews || 0, icon: StarIcon, href: '/marketplace?tab=reviews', color: 'yellow' },
    { label: 'Integrations', value: stats?.counts.integrations || 0, icon: PuzzlePieceIcon, href: '/integrations', color: 'indigo' },
    { label: 'Audit Logs', value: stats?.counts.auditLogs || 0, icon: DocumentTextIcon, href: '/audit-logs', color: 'gray' },
    { label: 'Consents', value: stats?.counts.consents || 0, icon: ShieldCheckIcon, href: '/settings/privacy', color: 'red' },
    { label: 'Data Requests', value: stats?.counts.dataRequests || 0, icon: UserGroupIcon, href: '/settings/privacy', color: 'orange' },
  ];

  if (loading) return <div className="p-8 text-gray-500">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name || user?.email}!</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-800">{card.value}</p>
            </div>
            <card.icon className={`w-8 h-8 text-${card.color}-500`} />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Recent Stakes
            <Link href="/staking" className="text-sm text-indigo-600 hover:underline flex items-center">
              View all <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
            </Link>
          </h2>
          {stats?.recent.stakes.length === 0 ? (
            <p className="text-gray-500 text-sm">No stakes yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats?.recent.stakes.map((stake) => (
                <li key={stake.id} className="flex justify-between text-sm border-b pb-2">
                  <span>Staked <span className="font-medium">{stake.amount}</span> on <span className="font-medium">{stake.agent?.name || 'agent'}</span></span>
                  <span className="text-gray-400 text-xs">{new Date(stake.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Recent Proposals
            <Link href="/governance" className="text-sm text-indigo-600 hover:underline flex items-center">
              View all <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
            </Link>
          </h2>
          {stats?.recent.proposals.length === 0 ? (
            <p className="text-gray-500 text-sm">No proposals created.</p>
          ) : (
            <ul className="space-y-3">
              {stats?.recent.proposals.map((prop) => (
                <li key={prop.id} className="flex justify-between text-sm border-b pb-2">
                  <span className="truncate max-w-[200px] font-medium">{prop.title}</span>
                  <span className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${prop.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                      {prop.status}
                    </span>
                    <span className="text-gray-400 text-xs">{new Date(prop.createdAt).toLocaleDateString()}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            Your Reviews
            <Link href="/marketplace?tab=reviews" className="text-sm text-indigo-600 hover:underline flex items-center">
              View all <ArrowTopRightOnSquareIcon className="w-4 h-4 ml-1" />
            </Link>
          </h2>
          {stats?.recent.reviews.length === 0 ? (
            <p className="text-gray-500 text-sm">You haven't reviewed any templates.</p>
          ) : (
            <ul className="space-y-3">
              {stats?.recent.reviews.map((review) => (
                <li key={review.id} className="flex justify-between text-sm border-b pb-2">
                  <span>Reviewed <span className="font-medium">{review.template?.name}</span> – {review.rating}★</span>
                  <span className="text-gray-400 text-xs">{new Date(review.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/agents/create" className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-center text-sm hover:bg-indigo-100">Create Agent</Link>
            <Link href="/staking" className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-sm hover:bg-green-100">Stake Tokens</Link>
            <Link href="/governance/create" className="bg-purple-50 text-purple-700 p-3 rounded-lg text-center text-sm hover:bg-purple-100">New Proposal</Link>
            <Link href="/integrations" className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-center text-sm hover:bg-indigo-100">Add Integration</Link>
            <Link href="/marketplace" className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-center text-sm hover:bg-yellow-100">Browse Marketplace</Link>
            <Link href="/settings/privacy" className="bg-red-50 text-red-700 p-3 rounded-lg text-center text-sm hover:bg-red-100">Privacy Settings</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
