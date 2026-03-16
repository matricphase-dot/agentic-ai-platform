"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface UserStats {
  balance: number;
  tokenBalance: number;
  reputation: number;
  agentsCount: number;
  stakingAmount: number;
  proposalsCount: number;
  marketplaceListings: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    balance: 0,
    tokenBalance: 0,
    reputation: 0,
    agentsCount: 0,
    stakingAmount: 0,
    proposalsCount: 0,
    marketplaceListings: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch agents count
        const agentsRes = await api.get("/agents");
        const agentsCount = agentsRes.data.length || 0;

        // For other stats, use dummy data or endpoints if available
        // (these may 404 but we'll catch and use defaults)
        let stakingAmount = 0, proposalsCount = 0, marketplaceListings = 0;
        try {
          const stakingRes = await api.get("/staking");
          stakingAmount = stakingRes.data.total || 0;
        } catch { /* ignore */ }
        try {
          const proposalsRes = await api.get("/proposals");
          proposalsCount = proposalsRes.data.length || 0;
        } catch { /* ignore */ }
        try {
          const marketplaceRes = await api.get("/marketplace");
          marketplaceListings = marketplaceRes.data.length || 0;
        } catch { /* ignore */ }

        setStats({
          balance: user?.balance || 0,
          tokenBalance: user?.tokenBalance || 0,
          reputation: user?.reputation || 0,
          agentsCount,
          stakingAmount,
          proposalsCount,
          marketplaceListings,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    if (user) {
      fetchStats();
    } else {
      setIsLoadingStats(false);
    }
  }, [user]);

  if (loading || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Balance</p>
            <p className="text-2xl font-bold">${stats.balance.toFixed(2)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Token Balance</p>
            <p className="text-2xl font-bold">{stats.tokenBalance} AGENT</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Reputation</p>
            <p className="text-2xl font-bold">{stats.reputation}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <h2 className="text-2xl font-semibold mb-4">Platform Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Your Agents</p>
          <p className="text-3xl font-bold">{stats.agentsCount}</p>
          <Link href="/agent-chat" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
            Manage ?
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Staking Amount</p>
          <p className="text-3xl font-bold">{stats.stakingAmount} AGENT</p>
          <Link href="/staking" className="text-sm text-green-600 hover:underline mt-2 inline-block">
            Stake more ?
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Active Proposals</p>
          <p className="text-3xl font-bold">{stats.proposalsCount}</p>
          <Link href="/proposals" className="text-sm text-purple-600 hover:underline mt-2 inline-block">
            View ?
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Marketplace</p>
          <p className="text-3xl font-bold">{stats.marketplaceListings}</p>
          <Link href="/marketplace" className="text-sm text-yellow-600 hover:underline mt-2 inline-block">
            Browse ?
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/agent-chat"
          className="bg-blue-600 text-white rounded-lg p-4 text-center hover:bg-blue-700 transition"
        >
          <div className="text-xl mb-2">??</div>
          <div className="font-semibold">Agent Chat</div>
          <div className="text-sm opacity-90">Create and chat with AI agents</div>
        </Link>
        <Link
          href="/knowledge"
          className="bg-green-600 text-white rounded-lg p-4 text-center hover:bg-green-700 transition"
        >
          <div className="text-xl mb-2">??</div>
          <div className="font-semibold">Knowledge Base</div>
          <div className="text-sm opacity-90">Upload documents and ask questions</div>
        </Link>
        <Link
          href="/recorder"
          className="bg-purple-600 text-white rounded-lg p-4 text-center hover:bg-purple-700 transition"
        >
          <div className="text-xl mb-2">??</div>
          <div className="font-semibold">Screen Recorder</div>
          <div className="text-sm opacity-90">Record and analyze screen activity</div>
        </Link>
      </div>
    </div>
  );
}
