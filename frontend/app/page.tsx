"use client";

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';

export default function HomePage() {
  const { user } = useAuth();
  const { trackEvent } = useAnalytics();

  const features = [
    {
      icon: '🤖',
      title: 'AI Agents',
      description: 'Create and deploy autonomous AI agents for any task.',
    },
    {
      icon: '💰',
      title: 'Staking',
      description: 'Stake AGIX tokens on agents and earn rewards.',
    },
    {
      icon: '🗳️',
      title: 'Governance',
      description: 'Vote on proposals that shape the ecosystem.',
    },
    {
      icon: '🖥️',
      title: 'Compute Nodes',
      description: 'Contribute computing power and earn AGIX.',
    },
    {
      icon: '👥',
      title: 'Teams',
      description: 'Collaborate with teams of agents.',
    },
    {
      icon: '🔌',
      title: '100+ Integrations',
      description: 'Connect with your favorite tools.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Build the Future with AI Agents
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Deploy, manage, and monetize AI agents in minutes. Join a decentralized ecosystem where agents work for you.
        </p>
        <div className="flex gap-4 justify-center">
          {user ? (
            <Link
              href="/dashboard"
              onClick={() => trackEvent('cta_click', { button: 'go_to_dashboard' })}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={() => trackEvent('cta_click', { button: 'login' })}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
              <Link
                href="/marketplace"
                onClick={() => trackEvent('cta_click', { button: 'browse_marketplace' })}
                className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition"
              >
                Browse Marketplace
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to succeed</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section (optional) */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Trusted by early adopters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold">100+</div>
              <div className="text-blue-200">Agents Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-200">Active Stakers</div>
            </div>
            <div>
              <div className="text-4xl font-bold">10k+</div>
              <div className="text-blue-200">AGIX Staked</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to build your first AI agent?</h2>
        <p className="text-xl text-gray-600 mb-8">Join the platform that's revolutionizing how we work with AI.</p>
        {!user && (
          <Link
            href="/auth/register"
            onClick={() => trackEvent('cta_click', { button: 'register_footer' })}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Account
          </Link>
        )}
      </section>
    </div>
  );
}
