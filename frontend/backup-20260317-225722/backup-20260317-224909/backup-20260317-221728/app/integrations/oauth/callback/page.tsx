'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from '@/lib/axios';

export default function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      router.push('/integrations?error=' + error);
      return;
    }
    if (code && state) {
      // Parse state to get connectorId (we encoded it)
      const [connectorId, userId] = state.split('|');
      // Exchange code
      axios.post('/api/oauth/exchange', {
        connectorId,
        code,
        redirectUri: window.location.origin + '/integrations/oauth/callback'
      }).then(() => {
        router.push('/integrations?success=true');
      }).catch(() => {
        router.push('/integrations?error=exchange_failed');
      });
    }
  }, [code, state, error, router]);

  return <div className="p-8">Processing OAuth callback...</div>;
}
