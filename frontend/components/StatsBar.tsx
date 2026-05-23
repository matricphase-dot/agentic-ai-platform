'use client';
import { useEffect, useState } from 'react';
import { API_URL } from '@/lib/config';

export default function StatsBar() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalInvocations: 0,
    activeNodes: 0,
    totalStaked: 0,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  useEffect(() => {
    fetch(`${API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setStats(data.data);
      })
      .catch((err) => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 px-8 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-sm">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-24 h-10 bg-white/10 rounded-lg animate-pulse mb-2" />
            <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 px-8 bg-white/[0.02] border border-white/5 rounded-[3rem] backdrop-blur-sm">
      {[
        { label: "Total Agents", value: stats.totalAgents, suffix: "" },
        { label: "Total Invocations", value: stats.totalInvocations, suffix: "" },
        { label: "Active Nodes", value: stats.activeNodes, suffix: "" },
        { label: "Total Staked AGNT", value: stats.totalStaked, suffix: "" },
      ].map((stat, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-1">
            {formatNumber(stat.value)}{stat.suffix}
          </div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
