'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { PlusIcon, TrashIcon, PencilIcon, PlayIcon } from '@heroicons/react/24/outline';

interface Webhook {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export default function WebhooksPage() {
  const { user } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Webhook | null>(null);
  const [form, setForm] = useState({ name: '', url: '', secret: '', events: '' });

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await axios.get('/api/webhooks');
      setWebhooks(res.data);
    } catch (error) {
      console.error('Failed to fetch webhooks', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const eventsArray = form.events.split(',').map(e => e.trim()).filter(e => e);
    const payload = { ...form, events: eventsArray };
    try {
      if (editing) {
        await axios.put(`/api/webhooks/${editing.id}`, payload);
      } else {
        await axios.post('/api/webhooks', payload);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', url: '', secret: '', events: '' });
      fetchWebhooks();
    } catch (error) {
      alert('Failed to save webhook');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this webhook?')) return;
    try {
      await axios.delete(`/api/webhooks/${id}`);
      fetchWebhooks();
    } catch (error) {
      alert('Failed to delete webhook');
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await axios.post(`/api/webhooks/${id}/test`);
      alert(`Test sent! Status: ${res.data.status} ${res.data.ok ? 'OK' : 'Failed'}`);
    } catch (error) {
      alert('Test failed');
    }
  };

  if (loading) return <div className="p-6">Loading webhooks...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Webhooks</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ name: '', url: '', secret: '', events: '' });
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          New Webhook
        </button>
      </div>

      {webhooks.length === 0 ? (
        <p className="text-gray-500">No webhooks created yet.</p>
      ) : (
        <div className="grid gap-4">
          {webhooks.map(wh => (
            <div key={wh.id} className="border rounded-lg p-4 bg-white shadow-sm flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{wh.name}</h2>
                <p className="text-sm text-gray-600 break-all">{wh.url}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Events: {wh.events.join(', ')}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${wh.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {wh.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleTest(wh.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Test">
                  <PlayIcon className="w-5 h-5" />
                </button>
                <button onClick={() => { setEditing(wh); setForm({ name: wh.name, url: wh.url, secret: wh.secret || '', events: wh.events.join(', ') }); setShowModal(true); }} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded" title="Edit">
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(wh.id)} className="p-2 text-red-600 hover:bg-red-50 rounded" title="Delete">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{editing ? 'Edit Webhook' : 'New Webhook'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Secret (optional, for HMAC)</label>
                <input
                  type="text"
                  value={form.secret}
                  onChange={(e) => setForm({ ...form, secret: e.target.value })}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Events (comma separated)</label>
                <input
                  type="text"
                  value={form.events}
                  onChange={(e) => setForm({ ...form, events: e.target.value })}
                  placeholder="agent.created, task.completed"
                  className="border p-2 w-full rounded"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}