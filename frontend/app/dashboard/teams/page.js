'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TeamsPage() {
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    fetchTeams();
  }, [isAuthenticated, token]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('http://localhost:8000/teams', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (id) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await fetch(`http://localhost:8000/teams/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchTeams(); // Refresh list
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Collaborative Teams</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage teams of AI agents working together
          </p>
        </div>
        <Link
          href="/dashboard/teams/create"
          className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition hover:from-purple-700 hover:to-pink-700"
        >
          + Create New Team
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search teams by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <div className="absolute left-4 top-3.5">??</div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="overflow-hidden rounded-xl bg-white shadow-lg transition-shadow hover:shadow-xl dark:bg-gray-800"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
                      <span className="text-white">??</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{team.name}</h3>
                      <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        {team.member_count || 0} members
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="text-gray-500 hover:text-gray-700">
                      ?
                    </button>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                  {team.description || 'No description provided'}
                </p>

                {/* Agent Members */}
                <div className="mb-4">
                  <div className="mb-2 flex -space-x-2">
                    {(team.agents || []).slice(0, 4).map((agent, index) => (
                      <div
                        key={index}
                        className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-purple-600 dark:border-gray-800"
                      ></div>
                    ))}
                    {team.member_count > 4 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 dark:border-gray-800 dark:bg-gray-700">
                        <span className="text-xs">
                          +{team.member_count - 4}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {team.member_count || 0} AI agents in team
                  </p>
                </div>

                <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">?</span>
                    <span>{team.task_count || 0} tasks completed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">??</span>
                    <span>${team.total_cost || '0.00'} spent</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/teams/${team.id}`}
                    className="flex-1 rounded-lg bg-purple-600 py-2 text-center text-white transition hover:bg-purple-700"
                  >
                    View Team
                  </Link>
                  <Link
                    href={`/dashboard/teams/${team.id}/execute`}
                    className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 py-2 text-center text-white transition hover:from-green-600 hover:to-blue-600"
                  >
                    Execute Task
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="mb-4 text-6xl">??</div>
          <h3 className="mb-2 text-xl font-bold">No Teams Found</h3>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            {searchTerm
              ? 'Try a different search term'
              : 'Create your first team of AI agents'}
          </p>
          <Link
            href="/dashboard/teams/create"
            className="inline-block rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 font-medium text-white transition hover:from-purple-700 hover:to-pink-700"
          >
            Create Your First Team
          </Link>
        </div>
      )}
    </div>
  );
}
