'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/agents', label: 'Agents' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/staking', label: 'Staking' },
    { href: '/governance', label: 'Governance' },
    { href: '/nodes', label: 'Nodes' },
    { href: '/teams', label: 'Teams' },
    { href: '/webhooks', label: 'Webhooks' },
    { href: '/reviews', label: 'Reviews' },
    { href: '/audit-logs', label: 'Audit Logs' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-40 w-64 bg-gray-800 text-white p-4 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        `}
      >
        <nav>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block py-2 px-4 rounded ${
                pathname === link.href ? 'bg-gray-700' : 'hover:bg-gray-700'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
