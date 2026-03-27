'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface DashboardStats {
  agentsCount: number;
  totalStaked: number;
  votes: number;
  reviews: number;
  dataRequests: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading dashboard...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/agents/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Create New Agent
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Agents</div>
          <div className="text-2xl font-bold">{stats?.agentsCount ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Total Staked</div>
          <div className="text-2xl font-bold">{stats?.totalStaked ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Votes</div>
          <div className="text-2xl font-bold">{stats?.votes ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Reviews</div>
          <div className="text-2xl font-bold">{stats?.reviews ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-gray-500 text-sm">Data Requests</div>
          <div className="text-2xl font-bold">{stats?.dataRequests ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
