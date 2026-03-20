'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { format } from 'date-fns';
import { Clock, RotateCcw, Trash2 } from 'lucide-react';

interface Version {
  id: string;
  version: number;
  name: string | null;
  description: string | null;
  createdAt: string;
  createdBy: string | null;
}

interface VersionHistoryProps {
  agentId: string;
  onRestore?: (versionId: string) => void;
}

export default function VersionHistory({ agentId, onRestore }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [agentId]);

  const fetchVersions = async () => {
    try {
      const res = await axios.get(`/api/agents/versions`);
      setVersions(res.data);
    } catch (error) {
      console.error('Failed to fetch versions', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Restore this version? The current agent will be overwritten.')) return;
    setRestoring(versionId);
    try {
      await axios.post(`/api/agents/restore`);
      alert('Agent restored successfully');
      onRestore?.(versionId);
      fetchVersions(); // refresh list
    } catch (error: any) {
      alert(error.response?.data?.error || 'Restore failed');
    } finally {
      setRestoring(null);
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm('Delete this version permanently?')) return;
    try {
      await axios.delete(`/api/agents/versions/${versionId}`);
      fetchVersions();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Delete failed');
    }
  };

  if (loading) return <div className="text-sm">Loading versions...</div>;

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4" /> Version History
      </h3>
      {versions.length === 0 ? (
        <p className="text-sm text-gray-500">No versions yet</p>
      ) : (
        <ul className="space-y-3">
          {versions.map((v) => (
            <li key={v.id} className="flex items-start justify-between border-b pb-2 last:border-0">
              <div>
                <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">v{v.version}</span>
                {v.name && <span className="ml-2 text-sm font-medium">{v.name}</span>}
                {v.description && <p className="text-xs text-gray-600 mt-1">{v.description}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(v.createdAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleRestore(v.id)}
                  disabled={restoring === v.id}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  title="Restore this version"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Delete version"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

