"use client";
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState({ agnt: 0, staked: 0 });

  const connectWallet = () => {
    setAddress('0x' + Math.random().toString(16).substring(2, 42));
    setBalance({ agnt: 1500, staked: 500 });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Web3 Wallet</h1>
        <p className="text-zinc-400">Connect your wallet to manage your AGNT tokens on-chain.</p>
      </div>

      <Card className="p-8 bg-zinc-900 border-zinc-800">
        {!address ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No wallet connected</h3>
            <p className="text-zinc-400 mb-6">Connect your web3 wallet to view balances and bridge tokens.</p>
            <Button onClick={connectWallet} className="bg-blue-600 hover:bg-blue-700">
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-6 border-b border-zinc-800">
              <div>
                <p className="text-sm text-zinc-400">Connected Address</p>
                <p className="font-mono text-white">{address}</p>
              </div>
              <Button variant="outline" onClick={() => setAddress('')}>Disconnect</Button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-black/20 p-6 rounded-lg border border-zinc-800">
                <p className="text-zinc-400 mb-1">On-chain AGNT Balance</p>
                <p className="text-3xl font-bold text-white">{balance.agnt.toLocaleString()}</p>
              </div>
              <div className="bg-black/20 p-6 rounded-lg border border-zinc-800">
                <p className="text-zinc-400 mb-1">Staked Balance</p>
                <p className="text-3xl font-bold text-blue-400">{balance.staked.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-6">
              <h4 className="text-lg font-medium text-white mb-4">Bridge Tokens</h4>
              <p className="text-zinc-400 text-sm mb-4">Full wallet connect and bridging coming soon.</p>
              <Button disabled className="w-full sm:w-auto">Bridge AGNT to Platform</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
