'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Agentic AI</h1>
        <p className="mt-4 text-lg text-gray-600">The platform for autonomous AI agents</p>
        <div className="mt-8">
          <Link
            href="/auth/login"
            className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    </div>
  );
}
