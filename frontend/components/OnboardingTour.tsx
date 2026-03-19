"use client";

import { useEffect, useState } from 'react';
import Joyride, { Step } from 'react-joyride';

const steps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to Agentic AI! Let us show you around.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.sidebar',
    content: 'This is the sidebar. Navigate to Agents, Marketplace, and more.',
    placement: 'right',
  },
  {
    target: 'a[href="/dashboard"]',
    content: 'Your dashboard shows an overview of your agents and activity.',
    placement: 'bottom',
  },
  {
    target: 'a[href="/agents"]',
    content: 'Here you can view and manage all your agents.',
    placement: 'bottom',
  },
  {
    target: 'a[href="/marketplace"]',
    content: 'Browse and deploy pre-built agent templates.',
    placement: 'bottom',
  },
  {
    target: 'a[href="/docs"]',
    content: 'Read the documentation to learn more about the API.',
    placement: 'bottom',
  },
];

export default function OnboardingTour() {
  const [isClient, setIsClient] = useState(false);
  const [run, setRun] = useState(false);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    // Mark that we're on the client
    setIsClient(true);

    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('onboardingSeen');
    if (!hasSeenTour) {
      // Wait a bit for the DOM to fully render
      const timer = setTimeout(() => setRun(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setTourCompleted(true);
    }
  }, []);

  const handleTourFinish = () => {
    localStorage.setItem('onboardingSeen', 'true');
    setRun(false);
    setTourCompleted(true);
  };

  // Don't render anything on server, and if client but tour completed, render nothing
  if (!isClient || tourCompleted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={(data) => {
        const { status } = data;
        if (status === 'finished' || status === 'skipped') {
          handleTourFinish();
        }
      }}
      styles={{
        options: {
          primaryColor: '#2563eb',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          textColor: '#1f2937',
        },
      }}
    />
  );
}
