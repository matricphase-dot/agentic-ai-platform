'use client';

import { useEffect, useState } from 'react';
import axios from '../../../lib/axios';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PlatformDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [invokingDeployId, setInvokingDeployId] = useState<string | null>(null);
  const [logsDeployId, setLogsDeployId] = useState<string | null>(null);
  const [logs, setLogs] = useState<any>(null);
  const [revenueAmount, setRevenueAmount] = useState<number>(10);
  const [processingDeployId, setProcessingDeployId] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchConnection();
  }, [id]);

  const fetchConnection = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/platforms/connections/${id}`);
      setConnection(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load connection');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm('Are you sure you want to revoke this connection?')) return;
    try {
      await axios.delete(`/platforms/connections/${id}`);
      alert('Connection revoked');
      router.push('/platforms');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke');
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const res = await axios.post('/platforms/deploy-with-agent', {
        platformId: connection.id,
        config: { test: true }
      });
      alert('Agent deployed successfully!');
      fetchConnection(); // refresh to show new deployment
    } catch (err: any) {
      alert(err.response?.data?.error || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const handleDeployToCloud = async (deploymentId: string) => {
    setProcessingDeployId(deploymentId);
    try {
      await axios.post(`/platforms/deployments/${deploymentId}/deploy-to-cloud`);
      alert('Deployed to cloud!');
      fetchConnection();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Cloud deployment failed');
    } finally {
      setProcessingDeployId(null);
    }
  };

  const handleInvoke = async (deploymentId: string) => {
    setInvokingDeployId(deploymentId);
    try {
      const payload = prompt('Enter payload (JSON):', '{}');
      if (!payload) return;
      const parsed = JSON.parse(payload);
      const res = await axios.post(`/platforms/deployments/${deploymentId}/invoke`, { payload: parsed });
      alert('Invocation result: ' + JSON.stringify(res.data.result));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Invocation failed');
    } finally {
      setInvokingDeployId(null);
    }
  };

  const handleViewLogs = async (deploymentId: string) => {
    setLogsDeployId(deploymentId);
    try {
      const res = await axios.get(`/platforms/deployments/${deploymentId}/logs`);
      setLogs(res.data);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to fetch logs');
    } finally {
      // Keep logs displayed
    }
  };

  const handleRemoveCloud = async (deploymentId: string) => {
    if (!confirm('Remove this deployment from cloud?')) return;
    setProcessingDeployId(deploymentId);
    try {
      await axios.delete(`/platforms/deployments/${deploymentId}/cloud`);
      alert('Removed from cloud');
      fetchConnection();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Removal failed');
    } finally {
      setProcessingDeployId(null);
    }
  };

  const handleRecordRevenue = async (deploymentId: string) => {
    setProcessingDeployId(deploymentId);
    try {
      await axios.post('/platforms/revenue', {
        deploymentId,
        amount: revenueAmount,
        description: 'Simulated revenue'
      });
      alert(`$${revenueAmount} revenue recorded!`);
      fetchConnection();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record revenue');
    } finally {
      setProcessingDeployId(null);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!connection) return <div className="p-8">Connection not found</div>;

  return (
    <div className="p-8">
      <div className="mb-4">
        <Link href="/platforms" className="text-blue-600 hover:underline">← Back to Platforms</Link>
      </div>
      <h1 className="text-3xl font-bold mb-6 capitalize">{connection.platform} Connection</h1>
      <div className="border rounded p-4 mb-6">
        <p><strong>ID:</strong> {connection.id}</p>
        <p><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded ${connection.status === 'active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {connection.status}
          </span>
        </p>
        <p><strong>Created:</strong> {new Date(connection.createdAt).toLocaleString()}</p>
        <p><strong>Last Used:</strong> {connection.lastUsed ? new Date(connection.lastUsed).toLocaleString() : 'Never'}</p>
      </div>

      <div className="mb-4">
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          {deploying ? 'Deploying...' : 'Deploy Test Agent'}
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <label className="font-medium">Revenue Amount:</label>
        <input
          type="number"
          value={revenueAmount}
          onChange={(e) => setRevenueAmount(parseInt(e.target.value))}
          className="border p-1 w-24"
          min="1"
        />
        <span>$AGENT</span>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Deployments</h2>
      {connection.deployments?.length === 0 ? (
        <p>No deployments yet.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Cloud Provider</th>
              <th>External ID</th>
              <th>Invocations</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {connection.deployments.map((dep: any) => (
              <tr key={dep.id}>
                <td className="text-sm">{dep.id.substring(0,8)}...</td>
                <td>
                  <span className={`px-2 py-1 rounded text-sm ${
                    dep.status === 'running' ? 'bg-green-200 text-green-800' : 'bg-gray-200'
                  }`}>
                    {dep.status}
                  </span>
                </td>
                <td>{dep.cloudProvider || '-'}</td>
                <td className="text-sm">{dep.externalId ? dep.externalId.substring(0,12)+'...' : '-'}</td>
                <td>{dep.invocations || 0}</td>
                <td>{dep.revenue} $AGENT</td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {!dep.externalId && (
                      <button
                        onClick={() => handleDeployToCloud(dep.id)}
                        disabled={processingDeployId === dep.id}
                        className="bg-purple-600 text-white px-2 py-1 rounded text-xs"
                      >
                        Deploy to Cloud
                      </button>
                    )}
                    {dep.externalId && (
                      <>
                        <button
                          onClick={() => handleInvoke(dep.id)}
                          disabled={invokingDeployId === dep.id}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Invoke
                        </button>
                        <button
                          onClick={() => handleViewLogs(dep.id)}
                          className="bg-yellow-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleRemoveCloud(dep.id)}
                          disabled={processingDeployId === dep.id}
                          className="bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          Remove
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRecordRevenue(dep.id)}
                      disabled={processingDeployId === dep.id}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Revenue
                    </button>
                  </div>
                  {logsDeployId === dep.id && logs && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <h4 className="font-bold">Cloud Logs:</h4>
                      <pre className="whitespace-pre-wrap">{logs.cloud?.join('\n')}</pre>
                      <h4 className="font-bold mt-1">Database Logs:</h4>
                      <ul>
                        {logs.database?.map((log: any) => (
                          <li key={log.id}>{log.timestamp}: {log.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {connection.status === 'active' && (
        <div className="mt-6">
          <button
            onClick={handleRevoke}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Revoke Connection
          </button>
        </div>
      )}
    </div>
  );
}