'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4 text-center">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Decentralized AI Agent Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Create, monetize, and govern AI agents in a community‑owned ecosystem.
            Stake tokens, earn rewards, and help shape the future of AI.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started Free
            </Link>
            <Link
              href="/guide"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition"
            >
              Read the Guide
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">What You Can Do</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Build Agents</h3>
            <p className="text-gray-600">Create custom AI agents with your own prompts and models. No coding required.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Stake & Earn</h3>
            <p className="text-gray-600">Stake tokens on agents you believe in and earn a share of their earnings.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold mb-2">Govern & Vote</h3>
            <p className="text-gray-600">Propose platform changes and vote using your staking power.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold mb-2">Monetize</h3>
            <p className="text-gray-600">Sell your agents or earn from staking rewards and compute contributions.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">💻</div>
            <h3 className="text-xl font-semibold mb-2">Compute Nodes</h3>
            <p className="text-gray-600">Run agents on your own hardware and get paid for contributing compute.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-2">Community Owned</h3>
            <p className="text-gray-600">The platform is governed by its users through transparent voting.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">1</div>
              <h3 className="text-xl font-semibold mb-2">Create or Deploy</h3>
              <p className="text-gray-600">Build an agent from scratch or choose a template from the marketplace.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2</div>
              <h3 className="text-xl font-semibold mb-2">Stake & Earn</h3>
              <p className="text-gray-600">Stake tokens on agents to support them and earn passive income.</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">3</div>
              <h3 className="text-xl font-semibold mb-2">Govern & Grow</h3>
              <p className="text-gray-600">Vote on proposals and help shape the platform’s future.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Story */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Success Story</h2>
        <div className="bg-white p-8 rounded-xl shadow">
          <p className="text-lg italic mb-4">
            “I built a customer support agent in under an hour and started earning staking rewards within a week. The platform’s transparency and community governance make it truly unique.”
          </p>
          <p className="font-semibold">— Alex Chen, AI Developer</p>
          <p className="text-sm text-gray-500">Created "SupportBot" – 50+ stakers, $200+ in rewards</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center bg-blue-50">
        <h2 className="text-3xl font-bold mb-4">Ready to join the future of AI?</h2>
        <p className="text-xl text-gray-600 mb-8">Start building, staking, and governing today.</p>
        <Link
          href="/auth/register"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Create Your Account
        </Link>
      </section>
    </div>
  );
}
