'use client';

import { useEffect } from 'react';

export function KeepAlive() {
  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL || 
      'https://agenticai-backend-xao9.onrender.com';
    
    // Wake up backend immediately on page load
    fetch(`${API}/health`).catch(() => {});
    
    // Keep alive every 14 minutes
    const interval = setInterval(() => {
      fetch(`${API}/health`).catch(() => {});
    }, 14 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return null;
}
