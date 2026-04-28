"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { teamsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CreateTeamPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await teamsApi.create({ name, description });
      if (res.success) {
        router.push(`/dashboard/teams/${res.data.id}`);
      } else {
        setError(res.message || 'Failed to create team');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Team</h1>
        <p className="text-zinc-400">Set up a new organization for collaborative agent development.</p>
      </div>

      <Card className="p-6 bg-zinc-900 border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/50 rounded-md text-sm">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Team Name</label>
            <input
              required
              className="w-full bg-black/50 border border-zinc-800 rounded-md px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Acme Corp AI"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Description</label>
            <textarea
              className="w-full bg-black/50 border border-zinc-800 rounded-md px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Briefly describe this team's purpose..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Creating...' : 'Create Team'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
