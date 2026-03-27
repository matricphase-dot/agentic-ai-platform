"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';

interface Settings {
  primaryColor: string;
  logoUrl: string;
  theme: string;
}

const ThemeContext = createContext<{ settings: Settings; updateSettings: (s: Settings) => void } | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({ primaryColor: '#6366f1', logoUrl: '', theme: 'light' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        setSettings(res.data);
      } catch (error) {
        console.error('Failed to fetch theme settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Settings) => {
    try {
      await api.put('/settings', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to update theme settings', error);
    }
  };

  if (loading) return <div>Loading theme...</div>;

  return (
    <ThemeContext.Provider value={{ settings, updateSettings }}>
      <div style={{ '--primary-color': settings.primaryColor } as React.CSSProperties}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
