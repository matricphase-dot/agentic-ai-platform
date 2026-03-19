'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CurrencyDollarIcon, HandRaisedIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function TokenPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFaucet, setShowFaucet] = useState(false);
  const [faucetMessage, setFaucetMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [balanceRes, proposalsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/balance`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/proposals`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);
      const balanceData = await balanceRes.json();
      const proposalsData = await proposalsRes.json();
      setBalance(balanceData.balance);
      setProposals(proposalsData.proposals);
    } catch (error) {
      console.error('Failed to fetch token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimFaucet = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/token/faucet`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setFaucetMessage('Tokens claimed successfully!');
      } else {
        setFaucetMessage('Error: ' + data.error);
      }
    } catch (error) {
      setFaucetMessage('Error claiming tokens');
    } finally {
      setShowFaucet(true);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading token dashboard...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">$AGENT Token Economy</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <CurrencyDollarIcon className="h-6 w-6 text-yellow-500 mr-2" />
            Your Token Balance
          </h2>
          <p className="text-4xl font-bold">{balance} $AGENT</p>
          {balance === 0 && (
            <button
              onClick={claimFaucet}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Claim Free Tokens
            </button>
          )}
          {faucetMessage && <p className="mt-2 text-sm text-green-600">{faucetMessage}</p>}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <HandRaisedIcon className="h-6 w-6 text-blue-500 mr-2" />
            Staking
          </h2>
          <p className="text-gray-600 mb-4">Stake your $AGENT on agents to earn rewards and voting power.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Go to Staking
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <ChartBarIcon className="h-6 w-6 text-purple-500 mr-2" />
          Active Governance Proposals
        </h2>
        {proposals.length === 0 ? (
          <p className="text-gray-500">No active proposals. Be the first to create one!</p>
        ) : (
          <div className="space-y-4">
            {proposals.map((p: any) => (
              <div key={p.id} className="border p-4 rounded">
                <h3 className="font-medium">{p.title}</h3>
                <p className="text-sm text-gray-600">{p.description}</p>
                <div className="mt-2 flex justify-between text-sm">
                  <span>For: {p.forVotes}</span>
                  <span>Against: {p.againstVotes}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="bg-green-600 text-white px-3 py-1 rounded text-xs">Vote For</button>
                  <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">Vote Against</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
