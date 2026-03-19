'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldData: any;
  newData: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/api/audit-logs');
      setLogs(res.data);
    } catch (error) {
      console.error('Failed to fetch audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading audit logs...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>
      {logs.length === 0 ? (
        <p className="text-gray-500">No audit logs found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Timestamp</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Entity</th>
                <th className="px-4 py-2 text-left">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}</td>
                  <td className="px-4 py-2">{log.action}</td>
                  <td className="px-4 py-2">{log.entity} {log.entityId && `(${log.entityId})`}</td>
                  <td className="px-4 py-2">
                    {log.oldData && (
                      <details>
                        <summary className="cursor-pointer text-blue-600">Old Data</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">{JSON.stringify(log.oldData, null, 2)}</pre>
                      </details>
                    )}
                    {log.newData && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-green-600">New Data</summary>
                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded">{JSON.stringify(log.newData, null, 2)}</pre>
                      </details>
                    )}
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
