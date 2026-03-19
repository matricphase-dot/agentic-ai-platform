'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { businessApi } from '@/lib/api';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function LaunchPage() {
  const { user } = useAuth();
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('ECOMMERCE');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLaunch = async () => {
    if (!user) {
      setError('You must be logged in');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await businessApi.launch(idea, industry);
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Launch failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Launch an <span className="text-blue-600">Autonomous Business</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-xl text-gray-500">
            Describe your idea – our AI agents will build, launch, and scale it for you.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="px-6 py-8 sm:p-10">
            <div className="space-y-6">
              <div>
                <label htmlFor="idea" className="block text-sm font-medium text-gray-700">
                  Business Idea
                </label>
                <textarea
                  id="idea"
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="E.g., A subscription box for rare hot sauces with monthly recipes..."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <select
                  id="industry"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                >
                  <option value="ECOMMERCE">E‑commerce</option>
                  <option value="SAAS">SaaS</option>
                  <option value="AGENCY">Agency</option>
                  <option value="CONTENT">Content</option>
                  <option value="CONSULTING">Consulting</option>
                  <option value="MARKETPLACE">Marketplace</option>
                </select>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                onClick={handleLaunch}
                disabled={loading || !idea}
                className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-all hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="mr-3 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI Agents are building...
                  </>
                ) : (
                  <>
                    <RocketLaunchIcon className="mr-2 h-6 w-6" />
                    Launch Autonomous Business
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">🚀 Business Launched Successfully!</h2>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Business Details</h3>
                <p className="text-gray-600">{result.business.name}</p>
                <p className="text-sm text-gray-500">ID: {result.business.id}</p>
              </div>

              {result.team && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">Assigned Team</h3>
                  <ul className="mt-2 space-y-1">
                    {result.team.map((member: any) => (
                      <li key={member.id} className="text-sm text-gray-600">
                        {member.name} – {member.role}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.marketingMaterials && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900">AI‑Generated Marketing</h3>
                  <div className="mt-2 rounded-md bg-gray-50 p-3">
                    <p className="text-sm text-gray-700"><span className="font-medium">FB Headline:</span> {result.marketingMaterials.facebookHeadline}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">FB Text:</span> {result.marketingMaterials.facebookText}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Instagram:</span> {result.marketingMaterials.instagramCaption}</p>
                    <p className="text-sm text-gray-700"><span className="font-medium">Email Subject:</span> {result.marketingMaterials.emailSubject}</p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900">Next Steps</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-600">
                  {result.nextSteps?.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


