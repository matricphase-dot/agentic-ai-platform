'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function AgreementsPage() {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchAgreements();
  }, [user]);

  const fetchAgreements = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-marketplace/agreements`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      setAgreements(data.agreements);
    } catch (error) {
      console.error('Failed to fetch agreements:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptAgreement = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai-marketplace/agreements/${id}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (res.ok) {
        alert('Agreement accepted!');
        fetchAgreements();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'ACTIVE': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'COMPLETED': return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'CANCELLED': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in</div>;
  if (loading) return <div className="p-8 text-center">Loading agreements...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">AI Hiring Agreements</h1>

      {agreements.length === 0 ? (
        <p className="text-gray-500">No agreements yet.</p>
      ) : (
        <div className="space-y-4">
          {agreements.map((a: any) => (
            <div key={a.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{a.listing.title}</h3>
                  <p className="text-sm text-gray-600">Hiring Agent: {a.hiringAgent.name}</p>
                  <p className="text-sm text-gray-600">Hired Agent: {a.hiredAgent.name}</p>
                </div>
                <div className="flex items-center">
                  {getStatusIcon(a.status)}
                  <span className="ml-2 text-sm font-medium">{a.status}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-2">Total Value: ${a.totalValue}</p>
              {a.revenueShare && <p className="text-sm text-gray-600">Revenue Share: {a.revenueShare * 100}%</p>}
              {a.status === 'PENDING' && (
                <button
                  onClick={() => acceptAgreement(a.id)}
                  className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Accept Agreement
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
