"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  team_agents?: {
    agent: {
      id: string;
      name: string;
      agentType: string;
    };
  }[];
}

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: '', description: '' });
  const [availableAgents, setAvailableAgents] = useState<any[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  useEffect(() => {
    fetchTeams();
    fetchAgents();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents');
      setAvailableAgents(res.data);
    } catch (err) {
      console.error('Failed to fetch agents', err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teams', {
        name: newTeam.name,
        description: newTeam.description,
        agentIds: selectedAgents
      });
      setShowCreateModal(false);
      setNewTeam({ name: '', description: '' });
      setSelectedAgents([]);
      fetchTeams();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create team');
    }
  };

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  if (loading) return <div className="p-8 text-center">Loading teams...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No teams yet. Create one!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <div key={team.id} className="border rounded-lg p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">{team.name}</h2>
              <p className="text-gray-600 mb-4">{team.description || 'No description'}</p>
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Agents ({team.team_agents?.length || 0})
                </div>
                <div className="flex flex-wrap gap-2">
                  {team.team_agents?.map(tag => (
                    <div
                      key={tag.agent.id}
                      className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      <span>🤖</span>
                      {tag.agent.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/teams/${team.id}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={async () => {
                    if (confirm('Delete this team?')) {
                      try {
                        await api.delete(`/teams/${team.id}`);
                        fetchTeams();
                      } catch (err) {
                        alert('Failed to delete team');
                      }
                    }
                  }}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create New Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Team Name</label>
                <input
                  type="text"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Agents</label>
                <div className="max-h-48 overflow-y-auto border rounded p-2">
                  {availableAgents.map(agent => (
                    <label key={agent.id} className="flex items-center gap-2 p-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                      />
                      <span>{agent.name} ({agent.agentType})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
