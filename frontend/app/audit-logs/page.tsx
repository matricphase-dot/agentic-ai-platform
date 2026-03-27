'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: { email: string };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/audit-logs');
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div>Loading audit logs...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {logs.length === 0 ? (
        <p>No audit logs available.</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div key={log.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{log.action}</p>
                  <p className="text-sm text-gray-600">
                    {log.entity} {log.entityId && `(ID: ${log.entityId})`}
                  </p>
                  {log.oldData && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-500">Old Data</summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.oldData, null, 2)}
                      </pre>
                    </details>
                  )}
                  {log.newData && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-blue-500">New Data</summary>
                      <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(log.newData, null, 2)}
                      </pre>
                    </details>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {log.user?.email || 'System'} | IP: {log.ipAddress || 'N/A'} | 
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
