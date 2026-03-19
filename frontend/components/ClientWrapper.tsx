"use client";

import dynamic from 'next/dynamic';

const OnboardingTour = dynamic(
  () => import('@/components/OnboardingTour'),
  { ssr: false }
);

export default function ClientWrapper() {
  return <OnboardingTour />;
}
