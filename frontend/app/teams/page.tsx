'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

interface Team {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members?: any[];
  agents?: any[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams');
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch teams', err);
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/teams', { name, description });
      setSuccess('Team created successfully');
      setName('');
      setDescription('');
      fetchTeams();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading teams...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Teams</h1>

      {/* Create Team Form */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Create a New Team</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Team Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border rounded p-2"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Team'}
          </button>
        </form>
      </div>

      {/* Teams List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Teams</h2>
        {teams.length === 0 ? (
          <p>No teams yet. Create one to collaborate.</p>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="bg-white p-4 rounded shadow">
                <h3 className="font-bold text-lg">{team.name}</h3>
                {team.description && <p className="text-gray-600 mb-2">{team.description}</p>}
                <p className="text-sm text-gray-500">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </p>
                {/* Placeholder for members and agents – we could expand later */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
