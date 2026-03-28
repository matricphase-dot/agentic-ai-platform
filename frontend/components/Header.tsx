'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  email: string;
  name?: string;
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">Agentic AI Platform</h1>
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-gray-600">
            {user.name || user.email}
          </span>
        )}
        <button onClick={handleLogout} className="text-red-500 hover:text-red-700">
          Logout
        </button>
      </div>
    </header>
  );
}
