"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { teamsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    teamsApi.get(teamId).then(res => {
      if (res.success) setTeam(res.data);
      setLoading(false);
    });
  }, [teamId]);

  if (loading) return <div className="p-8 text-zinc-400">Loading team details...</div>;
  if (!team) return <div className="p-8 text-red-400">Team not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in p-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-400">
          {team.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{team.name}</h1>
          <p className="text-zinc-400">{team.description || "No description provided."}</p>
        </div>
      </div>

      <div className="flex border-b border-zinc-800">
        {['overview', 'members', 'agents', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm capitalize ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-400' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <p className="text-zinc-400 mb-2">Total Members</p>
            <p className="text-3xl font-bold text-white">{team.members?.length || 0}</p>
          </Card>
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <p className="text-zinc-400 mb-2">Active Agents</p>
            <p className="text-3xl font-bold text-white">{team.agents?.length || 0}</p>
          </Card>
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <p className="text-zinc-400 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-green-400">$0.00</p>
          </Card>
        </div>
      )}

      {activeTab === 'members' && (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="p-6 flex justify-between items-center border-b border-zinc-800">
            <h3 className="font-medium text-white">Team Members</h3>
            <Button className="bg-blue-600 hover:bg-blue-700 text-xs py-1 h-8">Invite Member</Button>
          </div>
          <div className="divide-y divide-zinc-800">
            {team.members?.map((m: any) => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs">
                    {m.user?.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.user?.name || 'Unknown User'}</p>
                    <p className="text-xs text-zinc-500">{m.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-zinc-900">{m.role}</Badge>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-7 text-xs">Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'agents' && (
        <div className="grid gap-4">
          {team.agents?.length ? (
            team.agents.map((a: any) => (
              <Card key={a.id} className="p-4 bg-zinc-900 border-zinc-800 flex justify-between items-center">
                <span className="font-medium text-white">{a.name}</span>
                <Badge>{a.status}</Badge>
              </Card>
            ))
          ) : (
            <div className="p-8 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-lg">No agents in this team.</div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <Card className="p-6 bg-zinc-900 border-red-900/30">
          <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-zinc-500 mb-4">Deleting this team is irreversible and will remove all members.</p>
          <Button variant="destructive">Delete Team</Button>
        </Card>
      )}
    </div>
  );
}
