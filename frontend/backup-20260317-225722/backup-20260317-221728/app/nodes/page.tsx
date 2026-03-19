"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Server, Plus, Activity, DollarSign, Loader2, Cpu, HardDrive, Wifi } from "lucide-react";

interface Node {
  id: string;
  name: string;
  description?: string;
  status: string;
  specs: any;
  location?: string;
  version: string;
  lastPing: string;
  createdAt: string;
  _count: { tasks: number; rewards: number };
}

interface Reward {
  id: string;
  amount: number;
  reason: string;
  createdAt: string;
  node: Node;
}

export default function NodesPage() {
  const { user } = useAuth();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newSpecs, setNewSpecs] = useState("{\"cpu\":4,\"ram\":8,\"storage\":100}");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nodesRes, earningsRes] = await Promise.all([
        api.get('/nodes/my-nodes'),
        api.get('/nodes/earnings')
      ]);
      setNodes(nodesRes.data);
      setRewards(earningsRes.data.rewards);
      setTotalEarned(earningsRes.data.total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerNode = async () => {
    if (!newName) return;
    let specs;
    try {
      specs = JSON.parse(newSpecs);
    } catch {
      alert('Invalid JSON for specs');
      return;
    }
    try {
      const res = await api.post('/nodes/register', {
        name: newName,
        description: newDesc,
        location: newLocation,
        specs,
        version: '1.0.0'
      });
      setNodes([res.data, ...nodes]);
      setShowRegister(false);
      setNewName("");
      setNewDesc("");
      setNewLocation("");
      setNewSpecs("{\"cpu\":4,\"ram\":8,\"storage\":100}");
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Failed to register node');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Node Network</h1>
        <button
          onClick={() => setShowRegister(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Register Node
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Server className="w-5 h-5" />
            <span className="text-sm font-medium">Total Nodes</span>
          </div>
          <div className="text-2xl font-bold">{nodes.length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Online Nodes</span>
          </div>
          <div className="text-2xl font-bold">{nodes.filter(n => n.status === 'online').length}</div>
        </div>
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <DollarSign className="w-5 h-5" />
            <span className="text-sm font-medium">Total Earned</span>
          </div>
          <div className="text-2xl font-bold">{totalEarned} AGIX</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nodes list */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">My Nodes</h2>
          {nodes.length === 0 ? (
            <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
              <Server className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No nodes registered yet.</p>
              <button
                onClick={() => setShowRegister(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Register First Node
              </button>
            </div>
          ) : (
            nodes.map(node => (
              <div key={node.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${node.status === 'online' ? 'bg-green-500' : node.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                    <h3 className="font-medium text-lg">{node.name}</h3>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{node.version}</span>
                </div>
                {node.description && <p className="text-sm text-gray-600 mb-2">{node.description}</p>}
                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-2">
                  <div className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {node.specs.cpu} vCPU</div>
                  <div className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> {node.specs.ram} GB RAM</div>
                  <div className="flex items-center gap-1"><Wifi className="w-3 h-3" /> {node.location || 'Unknown'}</div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Last ping: {new Date(node.lastPing).toLocaleString()}</span>
                  <span>Tasks: {node._count.tasks}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Earnings */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Earnings</h2>
          {rewards.length === 0 ? (
            <p className="text-gray-500">No rewards yet.</p>
          ) : (
            <div className="space-y-2">
              {rewards.slice(0, 10).map(r => (
                <div key={r.id} className="border rounded-lg p-3 bg-white">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{r.reason}</span>
                    <span className="text-green-600 font-bold">+{r.amount} AGIX</span>
                  </div>
                  <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
                  <div className="text-xs">Node: {r.node.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Register a Node</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Node Name *</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location (optional)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="e.g., us-east-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Specs (JSON) *</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
                  rows={4}
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={registerNode}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Register
              </button>
              <button
                onClick={() => setShowRegister(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
