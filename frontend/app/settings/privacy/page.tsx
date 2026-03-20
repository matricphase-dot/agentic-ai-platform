"use client";

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

export default function PrivacySettings() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConsents();
      fetchRequests();
    }
  }, [user]);

  const fetchConsents = async () => {
    try {
      const res = await axios.get('/api/consent');
      setConsents(res.data);
    } catch (error) {
      console.error('Failed to fetch consents', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/data-requests');
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleConsent = async (purpose: string, granted: boolean) => {
    try {
      await axios.post('/api/consent', { purpose, granted });
      fetchConsents(); // refresh
    } catch (error) {
      alert('Failed to update consent');
    }
  };

  const createRequest = async (type: string) => {
    try {
      await axios.post('/api/data-requests', { type });
      fetchRequests();
    } catch (error) {
      alert('Failed to create request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Privacy Settings</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Consent</h2>
        {[
          { purpose: 'marketing', label: 'Marketing emails' },
          { purpose: 'analytics', label: 'Usage analytics' },
          { purpose: 'data_sharing', label: 'Share data with partners' },
        ].map((item) => {
          const consent = consents.find(c => c.purpose === item.purpose);
          const granted = consent ? consent.granted : false;
          return (
            <div key={item.purpose} className="flex items-center justify-between border-b py-3">
              <span>{item.label}</span>
              <button
                onClick={() => toggleConsent(item.purpose, !granted)}
                className={px-4 py-2 rounded }
              >
                {granted ? 'Opted In' : 'Opted Out'}
              </button>
            </div>
          );
        })}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Data Requests</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => createRequest('ACCESS')} className="bg-blue-600 text-white px-4 py-2 rounded">
            Request Access
          </button>
          <button onClick={() => createRequest('DELETION')} className="bg-red-600 text-white px-4 py-2 rounded">
            Request Deletion
          </button>
        </div>
        {requests.length > 0 && (
          <ul className="border rounded">
            {requests.map((req) => (
              <li key={req.id} className="flex justify-between p-3 border-b last:border-0">
                <span>{req.type} – {req.status}</span>
                <span className="text-sm text-gray-500">{new Date(req.requestedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Link href="/privacy" className="text-blue-600">View full privacy policy</Link>
    </div>
  );
}


