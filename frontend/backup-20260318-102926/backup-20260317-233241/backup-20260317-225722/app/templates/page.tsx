'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function TemplatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTemplates();
  }, [user]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const launchTemplate = async (templateId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${templateId}/launch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ customizations: {} }), // can add custom name etc.
      });
      if (res.ok) {
        const data = await res.json();
        alert(`Business launched! Check your businesses page.`);
        router.push('/businesses');
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading templates...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Business Templates</h1>
      <p className="text-gray-600 mb-8">Choose a template to instantly launch an AI‑powered business.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t: any) => (
          <div key={t.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{t.name}</h3>
              <p className="text-gray-600 mb-4">{t.description}</p>
              <p className="text-sm text-gray-500 mb-4">Industry: {t.industry}</p>
              <button
                onClick={() => launchTemplate(t.id)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded hover:opacity-90 flex items-center justify-center"
              >
                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                Launch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
