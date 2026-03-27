'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [events, setEvents] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await api.get('/webhooks');
      setWebhooks(res.data);
    } catch (err) {
      console.error('Failed to fetch webhooks', err);
      setError('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const eventsArray = events.split(',').map(e => e.trim()).filter(e => e);
      await api.post('/webhooks', { name, url, events: eventsArray });
      setSuccess('Webhook created successfully');
      setName('');
      setUrl('');
      setEvents('');
      fetchWebhooks();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;
    try {
      await api.delete(`/webhooks/${id}`);
      setWebhooks(webhooks.filter(w => w.id !== id));
      setSuccess('Webhook deleted');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete webhook');
    }
  };

  if (loading) return <div>Loading webhooks...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Webhooks</h1>

      {/* Create Webhook Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create a Webhook</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Events (comma‑separated, e.g., agent.created, stake.created)</label>
            <input
              type="text"
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              placeholder="agent.created, stake.created"
              className="w-full border rounded p-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Webhook'}
          </button>
        </form>
      </div>

      {/* Webhooks List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Webhooks</h2>
        {webhooks.length === 0 ? (
          <p>No webhooks configured yet.</p>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{webhook.name}</h3>
                    <p className="text-gray-600 text-sm">URL: {webhook.url}</p>
                    <p className="text-gray-600 text-sm">Events: {webhook.events?.join(', ') || 'All'}</p>
                    <p className="text-gray-500 text-sm">Status: {webhook.isActive ? 'Active' : 'Inactive'}</p>
                    <p className="text-gray-500 text-sm">Created: {new Date(webhook.createdAt).toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
