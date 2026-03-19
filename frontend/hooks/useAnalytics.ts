"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export function useAnalytics() {
  const pathname = usePathname();

  // Page view tracking
  useEffect(() => {
    if (typeof window.plausible !== 'undefined') {
      window.plausible('pageview');
    }
  }, [pathname]);

  // Custom event tracking
  const trackEvent = (eventName: string, props?: Record<string, any>) => {
    if (typeof window.plausible !== 'undefined') {
      window.plausible(eventName, { props });
    } else if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, props);
    }
  };

  return { trackEvent };
}
