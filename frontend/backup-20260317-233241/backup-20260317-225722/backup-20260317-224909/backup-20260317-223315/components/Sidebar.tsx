'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  HomeIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  CircleStackIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  DocumentDuplicateIcon,
  BriefcaseIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  DocumentTextIcon,
  StarIcon,
  ClockIcon,
  GlobeAltIcon,
  BookOpenIcon,
 ArrowPathIcon , PaintBrushIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, requiresAuth: true },
  { name: 'Agents', href: '/agents', icon: CpuChipIcon, requiresAuth: true },
  { name: 'Launch', href: '/launch', icon: RocketLaunchIcon, requiresAuth: true },
  { name: 'Templates', href: '/templates', icon: RocketLaunchIcon, requiresAuth: true },
  { name: 'Self-Evolving', href: '/self-evolving', icon: ChartBarIcon, requiresAuth: true },
  { name: 'Staking', href: '/staking', icon: ChartBarIcon, requiresAuth: true },
  { name: 'Governance', href: '/governance', icon: UserGroupIcon, requiresAuth: true },
  { name: 'Nodes', href: '/nodes', icon: CircleStackIcon, requiresAuth: true },
  { name: 'Platforms', href: '/platforms', icon: Cog6ToothIcon, requiresAuth: true },
  { name: 'Venture', href: '/venture', icon: BriefcaseIcon, requiresAuth: true },
  { name: 'Nations', href: '/nations', icon: BuildingOfficeIcon, requiresAuth: true },
  { name: 'Moats', href: '/moats', icon: Cog6ToothIcon, requiresAuth: true },
  { name: 'Franchise Marketplace', href: '/replication', icon: CurrencyDollarIcon, requiresAuth: true },
  { name: 'My Blueprints', href: '/replication/my', icon: DocumentDuplicateIcon, requiresAuth: true },
  { name: 'Derivatives', href: '/derivatives', icon: ChartBarIcon, requiresAuth: true },
  { name: 'Connectors', href: '/connectors', icon: Cog6ToothIcon, requiresAuth: true },
  { name: 'Learning', href: '/learning', icon: ChartBarIcon, requiresAuth: true },
  { name: 'Token Economy', href: '/token', icon: CurrencyDollarIcon, requiresAuth: true },
  { name: 'AI Marketplace', href: '/ai-marketplace', icon: BriefcaseIcon, requiresAuth: true },
  { name: 'My Agreements', href: '/ai-marketplace/agreements', icon: UserGroupIcon, requiresAuth: true },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, requiresAuth: true },
  { name: 'Team', href: '/team', icon: UserGroupIcon, requiresAuth: true },
  { name: 'Audit Logs', href: '/audit-logs', icon: DocumentTextIcon, requiresAuth: true },
  { name: 'My Reviews', href: '/reviews', icon: StarIcon, requiresAuth: true },
  { name: 'Agent Versions', href: '/agent-versions', icon: ClockIcon, requiresAuth: true },
  { name: 'Public Agents', href: '/public-agents', icon: GlobeAltIcon, requiresAuth: false },
  { name: 'My Public Agents', href: '/my-public-agents', icon: UserGroupIcon, requiresAuth: true },
  { name: 'Documentation', href: '/docs', icon: BookOpenIcon, requiresAuth: false },
  { name: 'Webhooks', href: '/webhooks', icon: ArrowPathIcon, requiresAuth: true },
    { name: 'Appearance', href: '/settings/appearance', icon: PaintBrushIcon, requiresAuth: true },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBagIcon, requiresAuth: false },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, requiresAuth: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${
        collapsed ? 'w-20' : 'w-64'
      } bg-gray-900 text-white transition-all duration-300 flex flex-col h-screen`}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        {!collapsed && <h1 className="text-xl font-bold">Agentic AI</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white">
          {collapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navigation.map((item) => {
          if (item.requiresAuth && !user) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={collapsed ? item.name : ''}
            >
              <item.icon className={`mr-3 h-5 w-5 flex-shrink-0`} />
              {!collapsed && item.name}
            </Link>
          );
        })}

        {!user && !collapsed && (
          <Link
            href="/auth/login"
            className="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Login
          </Link>
        )}
      </nav>
    </div>
  );
}








