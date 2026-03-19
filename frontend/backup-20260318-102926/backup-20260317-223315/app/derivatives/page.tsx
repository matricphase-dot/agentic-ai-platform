'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

export default function DerivativesPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [positions, setPositions] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [contractType, setContractType] = useState('FUTURE');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [strikePrice, setStrikePrice] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [settlementMetric, setSettlementMetric] = useState('reputation');

  useEffect(() => {
    if (!user) return;
    fetchContracts();
    fetchPositions();
    fetchAgents();
  }, [user]);

  const fetchContracts = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/derivatives/contracts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setContracts(data.contracts);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/derivatives/positions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setPositions(data.positions);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setAgents(data.agents);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/derivatives/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          contractType,
          agentId: selectedAgent,
          strikePrice,
          quantity,
          expiryDate,
          settlementMetric,
        }),
      });
      if (res.ok) {
        alert('Contract created!');
        fetchContracts();
        // Reset form
        setSelectedAgent('');
        setStrikePrice(100);
        setQuantity(1);
        setExpiryDate('');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBuy = async (contractId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/derivatives/contracts/${contractId}/buy`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        alert('Contract purchased!');
        fetchContracts();
        fetchPositions();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading derivatives market...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Agent Derivatives & Insurance</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'market' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('market')}
        >
          Market
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('create')}
        >
          Create Contract
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'positions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('positions')}
        >
          My Positions
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'insurance' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('insurance')}
        >
          Insurance
        </button>
      </div>

      {/* Market Tab */}
      {activeTab === 'market' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Open Contracts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Type</th>
                  <th className="text-left py-2">Agent</th>
                  <th className="text-left py-2">Seller</th>
                  <th className="text-right py-2">Strike</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Expiry</th>
                  <th className="text-right py-2">Premium</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts.filter(c => c.status === 'OPEN').map((c: any) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="py-2">{c.contractType}</td>
                    <td className="py-2">{c.agent.name}</td>
                    <td className="py-2">{c.seller.name}</td>
                    <td className="py-2 text-right">${c.strikePrice}</td>
                    <td className="py-2 text-right">{c.quantity}</td>
                    <td className="py-2 text-right">{new Date(c.expiryDate).toLocaleDateString()}</td>
                    <td className="py-2 text-right">{c.premium ? `$${c.premium}` : '-'}</td>
                    <td className="py-2 text-center">
                      {c.sellerId !== user.id && (
                        <button
                          onClick={() => handleBuy(c.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                        >
                          Buy
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {contracts.filter(c => c.status === 'OPEN').length === 0 && (
                  <tr><td colSpan={8} className="text-center py-4 text-gray-500">No open contracts.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Contract Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Contract</h2>
          <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
            <div>
              <label className="block mb-1">Contract Type</label>
              <select
                className="w-full border rounded p-2"
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                required
              >
                <option value="FUTURE">Future</option>
                <option value="CALL_OPTION">Call Option</option>
                <option value="PUT_OPTION">Put Option</option>
                <option value="INSURANCE">Insurance (Put)</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Agent</label>
              <select
                className="w-full border rounded p-2"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                required
              >
                <option value="">Select an agent</option>
                {agents.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Rep: {a.reputationScore}, Earnings: ${a.totalEarnings})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Settlement Metric</label>
              <select
                className="w-full border rounded p-2"
                value={settlementMetric}
                onChange={(e) => setSettlementMetric(e.target.value)}
                required
              >
                <option value="reputation">Reputation Score</option>
                <option value="earnings">Total Earnings</option>
                <option value="tasks">Tasks Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Strike Price ($)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(parseFloat(e.target.value))}
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Quantity (hours)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block mb-1">Expiry Date</label>
              <input
                type="date"
                className="w-full border rounded p-2"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Create Contract
            </button>
          </form>
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">My Positions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Side</th>
                  <th className="text-left py-2">Contract Type</th>
                  <th className="text-left py-2">Agent</th>
                  <th className="text-right py-2">Strike</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Expiry</th>
                  <th className="text-right py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p: any) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{p.side === 'long' ? 'Long' : 'Short'}</td>
                    <td className="py-2">{p.contract.contractType}</td>
                    <td className="py-2">{p.contract.agent.name}</td>
                    <td className="py-2 text-right">${p.contract.strikePrice}</td>
                    <td className="py-2 text-right">{p.quantity}</td>
                    <td className="py-2 text-right">{new Date(p.contract.expiryDate).toLocaleDateString()}</td>
                    <td className="py-2 text-right">{p.contract.status}</td>
                  </tr>
                ))}
                {positions.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-4 text-gray-500">No positions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insurance Tab */}
      {activeTab === 'insurance' && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Insurance Products (Put Options)</h2>
          <p className="text-gray-600 mb-4">Protect against agent underperformance. If agent's metric falls below strike, you get paid.</p>
          {/* You can reuse the market table filtered for PUT_OPTION/INSURANCE, but we already have market tab; maybe just list here */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Agent</th>
                  <th className="text-left py-2">Seller</th>
                  <th className="text-right py-2">Strike</th>
                  <th className="text-right py-2">Premium</th>
                  <th className="text-right py-2">Expiry</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {contracts
                  .filter(c => c.status === 'OPEN' && (c.contractType === 'PUT_OPTION' || c.contractType === 'INSURANCE'))
                  .map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{c.agent.name}</td>
                      <td className="py-2">{c.seller.name}</td>
                      <td className="py-2 text-right">${c.strikePrice}</td>
                      <td className="py-2 text-right">${c.premium}</td>
                      <td className="py-2 text-right">{new Date(c.expiryDate).toLocaleDateString()}</td>
                      <td className="py-2 text-center">
                        {c.sellerId !== user.id && (
                          <button
                            onClick={() => handleBuy(c.id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                          >
                            Buy Insurance
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                {contracts.filter(c => c.status === 'OPEN' && (c.contractType === 'PUT_OPTION' || c.contractType === 'INSURANCE')).length === 0 && (
                  <tr><td colSpan={6} className="text-center py-4 text-gray-500">No insurance products available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
