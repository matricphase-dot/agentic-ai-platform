"use client";

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(null);

  useEffect(() => {
    fetchConsent();
  }, []);

  const fetchConsent = async () => {
    try {
      const res = await axios.get('/api/consent');
      setConsent(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (purpose: string, granted: boolean) => {
    try {
      await axios.post('/api/consent', { purpose, granted });
      fetchConsent();
    } catch (err) {
      alert('Failed to update consent');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading privacy settings...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Privacy Settings</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Data Consent</h2>
        <p className="text-gray-600 mb-4">Manage how your data is used.</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Analytics</span>
              <p className="text-sm text-gray-500">Help us improve by sharing usage data.</p>
            </div>
            <button
              onClick={() => updateConsent('analytics', !consent?.analytics)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {consent?.analytics ? 'Disable' : 'Enable'}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Marketing</span>
              <p className="text-sm text-gray-500">Receive promotional emails and offers.</p>
            </div>
            <button
              onClick={() => updateConsent('marketing', !consent?.marketing)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {consent?.marketing ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
