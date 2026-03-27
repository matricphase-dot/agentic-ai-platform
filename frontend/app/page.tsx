import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="text-center max-w-4xl mx-auto">
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Agentic AI Platform
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        Build, deploy, and monetize AI agents. Stake on agents, vote on governance, and earn rewards.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Go to Dashboard
        </Link>
        <Link href="/marketplace" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300">
          Explore Marketplace
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <div className="text-3xl mb-2">🤖</div>
          <h2 className="text-xl font-semibold">Create Agents</h2>
          <p className="text-gray-600">Deploy autonomous AI agents for any task.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-3xl mb-2">💰</div>
          <h2 className="text-xl font-semibold">Stake & Earn</h2>
          <p className="text-gray-600">Stake tokens on agents and earn rewards.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <div className="text-3xl mb-2">🗳️</div>
          <h2 className="text-xl font-semibold">Governance</h2>
          <p className="text-gray-600">Vote on proposals that shape the ecosystem.</p>
        </div>
      </div>
    </div>
  );
}
