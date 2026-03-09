'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/audit-logs'); // Assuming you have this endpoint – adjust if needed
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>
      {logs.length === 0 ? (
        <p className="text-gray-500">No audit logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border text-left">Timestamp</th>
                <th className="py-2 px-4 border text-left">Action</th>
                <th className="py-2 px-4 border text-left">Entity</th>
                <th className="py-2 px-4 border text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-2 px-4 border">{log.action}</td>
                  <td className="py-2 px-4 border">{log.entity} {log.entityId ? `(${log.entityId})` : ''}</td>
                  <td className="py-2 px-4 border">
                    {log.oldData && <details><summary>Old</summary><pre>{JSON.stringify(log.oldData, null, 2)}</pre></details>}
                    {log.newData && <details><summary>New</summary><pre>{JSON.stringify(log.newData, null, 2)}</pre></details>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
