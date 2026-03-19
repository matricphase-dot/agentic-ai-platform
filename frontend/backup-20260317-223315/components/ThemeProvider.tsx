'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from '@/lib/axios';

interface ThemeContextType {
  primaryColor: string;
  logoUrl: string | null;
  theme: string;
  setTheme: (theme: string) => void;
  setPrimaryColor: (color: string) => void;
  setLogoUrl: (url: string | null) => void;
  saveSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState('light');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // Apply CSS variables
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.className = theme;
  }, [primaryColor, theme]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get('/api/settings');
      setPrimaryColor(res.data.primaryColor || '#6366f1');
      setLogoUrl(res.data.logoUrl || null);
      setTheme(res.data.theme || 'light');
    } catch (error) {
      console.error('Failed to fetch theme settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    await axios.put('/api/settings', { primaryColor, logoUrl, theme });
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{
      primaryColor, setPrimaryColor,
      logoUrl, setLogoUrl,
      theme, setTheme,
      saveSettings,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
