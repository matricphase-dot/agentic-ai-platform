'use client';

import { Check, Zap, AlertCircle } from 'lucide-react';

const integrations = [
  {
    name: 'Stripe',
    description: 'Payment processing and billing',
    connected: true,
    actions: ['Create invoice', 'Process payment', 'Manage subscriptions'],
  },
  {
    name: 'GitHub',
    description: 'Code repository and CI/CD',
    connected: true,
    actions: ['Create repository', 'Merge PR', 'Run workflow'],
  },
  {
    name: 'Twilio',
    description: 'SMS and voice communications',
    connected: false,
    actions: ['Send SMS', 'Make call', 'Check balance'],
  },
  {
    name: 'Google Sheets',
    description: 'Spreadsheet data management',
    connected: true,
    actions: ['Read data', 'Write data', 'Create sheet'],
  },
  {
    name: 'Slack',
    description: 'Team communication',
    connected: false,
    actions: ['Send message', 'Create channel', 'Upload file'],
  },
  {
    name: 'OpenAI',
    description: 'AI model API',
    connected: true,
    actions: ['Chat completion', 'Image generation', 'Embeddings'],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
        <p className="text-gray-600">Connect your tools and services</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Quick Stats */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Connection Status
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Connected</span>
              <span className="font-semibold text-green-600">
                {integrations.filter((i) => i.connected).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Available</span>
              <span className="font-semibold">{integrations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API Calls Today</span>
              <span className="font-semibold">1,247</span>
            </div>
          </div>
        </div>

        {/* Add Integration */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-medium text-gray-900">
            Add New Integration
          </h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search for service..."
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
            <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Browse All Services
            </button>
            <p className="text-sm text-gray-500">
              Can't find what you need?{' '}
              <a href="#" className="text-blue-600">
                Request an integration
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">
            All Integrations
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {integrations.map((integration) => (
            <div key={integration.name} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {integration.name}
                        </h3>
                        {integration.connected ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <Check className="mr-1 h-3 w-3" />
                            Connected
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Not Connected
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <div className="ml-13 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {integration.actions.map((action) => (
                        <span
                          key={action}
                          className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {action}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  {integration.connected ? (
                    <button className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Manage
                    </button>
                  ) : (
                    <button className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
