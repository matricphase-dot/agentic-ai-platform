'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpenIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ClockIcon,
  StarIcon,
  GlobeAltIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';

const sections = [
  {
    title: 'Getting Started',
    icon: BookOpenIcon,
    content: (
      <>
        <p className="mb-2">Welcome to Agentic AI – the AWS for AI agents. To get started:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li><Link href="/auth/register" className="text-indigo-600 hover:underline">Create an account</Link></li>
          <li>Log in with your credentials</li>
          <li>Create your first agent from scratch or choose a template from the <Link href="/marketplace" className="text-indigo-600 hover:underline">Marketplace</Link></li>
          <li>Start chatting with your agent on the <Link href="/agent-chat" className="text-indigo-600 hover:underline">Agent Chat</Link> page</li>
        </ol>
      </>
    ),
  },
  {
    title: 'Agents',
    icon: CpuChipIcon,
    content: (
      <>
        <p className="mb-2">Create, manage, and interact with AI agents.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>Create:</strong> Name, description, system prompt, and choose capabilities (echo, Ollama models, etc.)</li>
          <li><strong>Chat:</strong> Real-time messaging with your agents. Agents can reply using local LLMs (Ollama) or cloud models.</li>
          <li><strong>Version Control:</strong> Every update creates a new version. Restore previous versions from the agent detail page or the <Link href="/agent-versions" className="text-indigo-600 hover:underline">Agent Versions</Link> overview.</li>
          <li><strong>Public Sharing:</strong> Make your agent public so others can see it on the <Link href="/public-agents" className="text-indigo-600 hover:underline">Public Agents</Link> page. Toggle the status on the agent detail page.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Marketplace & Reviews',
    icon: StarIcon,
    content: (
      <>
        <p className="mb-2">Browse and deploy pre-built agent templates. Leave ratings and reviews to help the community.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><Link href="/marketplace" className="text-indigo-600 hover:underline">Browse templates</Link> by category, popularity, or new arrivals.</li>
          <li>Click on a template to see details, reviews, and the option to deploy it (creates a new agent for you).</li>
          <li>After using a template, you can <strong>write a review</strong> with a rating and comment. Your reviews appear on the template page and in <Link href="/reviews" className="text-indigo-600 hover:underline">My Reviews</Link>.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Staking & Governance',
    icon: CurrencyDollarIcon,
    content: (
      <>
        <p className="mb-2">Stake AGIX tokens on agents, earn daily rewards, and participate in governance.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>Staking:</strong> Go to <Link href="/staking" className="text-indigo-600 hover:underline">Staking</Link>, choose an agent, and stake an amount. Rewards are calculated daily based on a dynamic rate (influenced by agent performance).</li>
          <li><strong>Leaderboard:</strong> See the top-staked agents.</li>
          <li><strong>Governance:</strong> Create proposals, vote with your stake weight, and auto-finalize results. Visit <Link href="/governance" className="text-indigo-600 hover:underline">Governance</Link> to see active and past proposals.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Teams & Collaboration',
    icon: UserGroupIcon,
    content: (
      <>
        <p className="mb-2">Create teams of agents to work together on complex tasks.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>Create a team:</strong> Name, description, and select agents you own.</li>
          <li><strong>Broadcast messages:</strong> Send a message to all agents in a team at once.</li>
          <li>View your teams on the <Link href="/teams" className="text-indigo-600 hover:underline">Teams</Link> page.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Integrations',
    icon: PuzzlePieceIcon,
    content: (
      <>
        <p className="mb-2">Connect your agents to external services.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Browse available connectors (Slack, Discord, GitHub, etc.) on the <Link href="/integrations" className="text-indigo-600 hover:underline">Integrations</Link> page.</li>
          <li>For API-key based services, enter your credentials and connect.</li>
          <li>OAuth flows are supported – you’ll be redirected to the service to authorize.</li>
          <li>Once connected, your agents can send messages, read data, or trigger actions in those platforms (specific actions depend on the integration).</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Audit Logs & Compliance',
    icon: ShieldCheckIcon,
    content: (
      <>
        <p className="mb-2">Track user actions and manage your data privacy.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li><strong>Audit Logs:</strong> Every important action (login, agent creation, stake, vote) is logged. View your logs on the <Link href="/audit-logs" className="text-indigo-600 hover:underline">Audit Logs</Link> page.</li>
          <li><strong>Consent:</strong> Manage your marketing and analytics preferences in <Link href="/settings/privacy" className="text-indigo-600 hover:underline">Privacy Settings</Link>.</li>
          <li><strong>Data Requests:</strong> Request access to your data or request deletion from the same page.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'Node Network',
    icon: CodeBracketIcon,
    content: (
      <>
        <p className="mb-2">Contribute compute power and earn rewards.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Register your machine as a node on the <Link href="/nodes" className="text-indigo-600 hover:underline">Nodes</Link> page.</li>
          <li>Nodes can claim and execute tasks (inference, training, RAG).</li>
          <li>Earn AGIX rewards per completed task.</li>
        </ul>
      </>
    ),
  },
  {
    title: 'API Documentation',
    icon: DocumentTextIcon,
    content: (
      <>
        <p className="mb-2">Developers can interact with the platform programmatically.</p>
        <p className="text-gray-700">
          Interactive Swagger API docs are available at{' '}
          <a href="https://agentic-ai-platform-tajr.onrender.com/api-docs" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
            https://agentic-ai-platform-tajr.onrender.com/api-docs
          </a>
          {' '}(or your local backend at <code className="bg-gray-100 px-1 rounded">http://localhost:5000/api-docs</code>).
        </p>
        <p className="mt-2 text-gray-700">
          All API endpoints require a JWT token (obtained via login) sent in the <code className="bg-gray-100 px-1 rounded">Authorization: Bearer   &lt;token&gt;</code> header.
        </p>
      </>
    ),
  },
];

export default function DocsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Agentic AI Platform Documentation</h1>
      <p className="text-gray-600 mb-8">
        Welcome to the official user guide. Use the navigation above or scroll down to learn about each feature.
      </p>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center mb-4">
              <section.icon className="w-6 h-6 text-indigo-500 mr-2" />
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>
            <div className="prose prose-indigo max-w-none">{section.content}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
        <p className="text-sm text-indigo-800">
          <strong>Need more help?</strong> Feel free to open an issue on our GitHub repository or contact us at support@agentic.ai.
        </p>
      </div>
    </div>
  );
}

