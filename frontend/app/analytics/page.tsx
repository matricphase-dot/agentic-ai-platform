'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from @/lib/api;
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [agentTypeData, setAgentTypeData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [agentsRes, businessesRes] = await Promise.all([
        api.getAll(),
        api.getAll()
      ]);
      setAgents(agentsRes.data.agents);
      setBusinesses(businessesRes.data.businesses);

      // Simulate transaction history (since we don't have a real endpoint yet)
      // In a real app, you'd fetch from /api/transactions
      const mockTransactions = [
        { date: '2026-02-10', amount: 500, type: 'Revenue' },
        { date: '2026-02-11', amount: 1200, type: 'Revenue' },
        { date: '2026-02-12', amount: 800, type: 'Stake' },
        { date: '2026-02-13', amount: 2000, type: 'Revenue' },
        { date: '2026-02-14', amount: 1500, type: 'Revenue' },
        { date: '2026-02-15', amount: 600, type: 'Stake' },
      ];
      setTransactions(mockTransactions);

      // Prepare revenue chart data (group by date)
      const revenueByDate = mockTransactions
        .filter(t => t.type === 'Revenue')
        .reduce((acc: any, t) => {
          const date = t.date;
          if (!acc[date]) acc[date] = 0;
          acc[date] += t.amount;
          return acc;
        }, {});
      const revenueChartData = Object.entries(revenueByDate).map(([date, amount]) => ({
        date,
        amount
      }));
      setRevenueData(revenueChartData);

      // Agent type distribution
      const typeCount: Record<string, number> = {};
      agentsRes.data.agents.forEach((a: any) => {
        typeCount[a.agentType] = (typeCount[a.agentType] || 0) + 1;
      });
      const typeChartData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));
      setAgentTypeData(typeChartData);

    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalRevenue = businesses.reduce((sum: number, b: any) => sum + b.revenue, 0);
  const totalAgents = agents.length;
  const totalBusinesses = businesses.length;
  const totalEarnings = agents.reduce((sum: number, a: any) => sum + a.totalEarnings, 0);

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading analytics...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CpuChipIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Agents</p>
              <p className="text-2xl font-bold">{totalAgents}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <DocumentTextIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Businesses</p>
              <p className="text-2xl font-bold">{totalBusinesses}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Agent Earnings</p>
              <p className="text-2xl font-bold">${totalEarnings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue over time */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Revenue Over Time</h2>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No revenue data yet.</p>
          )}
        </div>

        {/* Agent type distribution */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Agent Types</h2>
          {agentTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {agentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No agents yet.</p>
          )}
        </div>
      </div>

      {/* Top Agents Table */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Top Performing Agents</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Earnings</th>
                <th className="text-right py-2">Reputation</th>
                <th className="text-right py-2">Tasks</th>
              </tr>
            </thead>
            <tbody>
              {agents
                .sort((a: any, b: any) => b.totalEarnings - a.totalEarnings)
                .slice(0, 5)
                .map((agent: any) => (
                  <tr key={agent.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{agent.name}</td>
                    <td className="py-2">{agent.agentType}</td>
                    <td className="py-2 text-right">${agent.totalEarnings}</td>
                    <td className="py-2 text-right">{agent.reputationScore}</td>
                    <td className="py-2 text-right">{agent.tasksCompleted}</td>
                  </tr>
                ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No agents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions (mock) */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-2">{t.date}</td>
                  <td className="py-2">{t.type}</td>
                  <td className="py-2 text-right">${t.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          * Transaction history is currently simulated. Real data coming soon.
        </p>
      </div>
    </div>
  );
}


