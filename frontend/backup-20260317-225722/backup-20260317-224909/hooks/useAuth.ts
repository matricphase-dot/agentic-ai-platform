'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

// Helper to convert snake_case to camelCase
function toCamel(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamel(v));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getCurrentUser()
      .then((res) => {
        // Transform snake_case to camelCase
        const transformedUser = toCamel(res.data.user);
        setUser(transformedUser);
      })
      .catch((err) => {
        console.error('Auth error:', err);
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await authApi.login(email, password);
      const { user, token } = res.data;
      // Transform user data
      const transformedUser = toCamel(user);
      localStorage.setItem('token', token);
      setUser(transformedUser);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return { user, loading, error, login, logout };
}

