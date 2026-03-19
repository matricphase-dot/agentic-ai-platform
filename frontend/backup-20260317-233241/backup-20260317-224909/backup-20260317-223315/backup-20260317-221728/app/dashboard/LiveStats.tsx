'use client';

import { useEffect, useState } from 'react';
import { useWebSocket } from '@/lib/websocket';

interface LiveStats {
  activeAgents: number;
  tasksToday: number;
  successRate: number;
  avgResponseTime: number;
}

export default function LiveStatsComponent() {
  const { socket, isConnected } = useWebSocket();
  const [stats, setStats] = useState<LiveStats>({
    activeAgents: 12,
    tasksToday: 156,
    successRate: 98.2,
    avgResponseTime: 2.4,
  });

  useEffect(() => {
    if (socket && isConnected) {
      // Request initial stats
      // sendMessage('get_stats', {});

      // Listen for stats updates
      socket.on('stats_update', (data: LiveStats) => {
        setStats(data);
      });

      // Simulate updates for demo
      const interval = setInterval(() => {
        setStats((prev) => ({
          ...prev,
          tasksToday: prev.tasksToday + Math.floor(Math.random() * 3),
          successRate: Math.min(
            99.9,
            prev.successRate + (Math.random() - 0.5) * 0.1
          ),
          avgResponseTime: Math.max(
            1.5,
            Math.min(3.5, prev.avgResponseTime + (Math.random() - 0.5) * 0.1)
          ),
        }));
      }, 5000);

      return () => {
        socket.off('stats_update');
        clearInterval(interval);
      };
    }
  }, [socket, isConnected]);

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Live Stats</h2>
          <p className="text-sm text-gray-600">
            Real-time agent performance metrics
          </p>
        </div>
        <div className="flex items-center">
          <div
            className={`mr-2 h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live' : 'Disconnected'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">
            {stats.activeAgents}
          </div>
          <p className="mt-1 text-sm text-gray-600">Active Agents</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">
            {stats.tasksToday}
          </div>
          <p className="mt-1 text-sm text-gray-600">Tasks Today</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">
            {stats.successRate.toFixed(1)}%
          </div>
          <p className="mt-1 text-sm text-gray-600">Success Rate</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-yellow-600">
            {stats.avgResponseTime.toFixed(1)}s
          </div>
          <p className="mt-1 text-sm text-gray-600">Avg Response</p>
        </div>
      </div>

      {isConnected && (
        <div className="mt-6 border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Last updated: Just now
            </span>
            {/* <button
              onClick={() => sendMessage('refresh_stats', {})}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Refresh
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
}



