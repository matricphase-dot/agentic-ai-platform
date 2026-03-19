"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/agents', label: 'Agents', icon: '🤖' },
    { href: '/marketplace', label: 'Marketplace', icon: '🏪' },
    { href: '/staking', label: 'Staking', icon: '💰' },
    { href: '/governance', label: 'Governance', icon: '🗳️' },
    { href: '/nodes', label: 'Nodes', icon: '🖥️' },
    { href: '/teams', label: 'Teams', icon: '👥' },
    { href: '/integrations', label: 'Integrations', icon: '🔌' },
    { href: '/public-agents', label: 'Public Agents', icon: '🌐' },
    { href: '/my-public-agents', label: 'My Public Agents', icon: '📢' },
    { href: '/agent-versions', label: 'Agent Versions', icon: '📝' },
    { href: '/reviews', label: 'Reviews', icon: '⭐' },
    { href: '/audit-logs', label: 'Audit Logs', icon: '📋' },
    { href: '/webhooks', label: 'Webhooks', icon: '🔔' },
    { href: '/settings', label: 'Settings', icon: '⚙️' },
    { href: '/docs', label: 'Documentation', icon: '📚' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Agentic AI</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded transition ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 rounded mt-4 text-red-600 hover:bg-red-50"
              >
                <span className="text-lg">🚪</span>
                <span className="text-sm">Logout</span>
              </button>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
