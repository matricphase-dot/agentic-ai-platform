'use client';

import { useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';

export default function AppearancePage() {
  const { user } = useAuth();
  const {
    primaryColor, setPrimaryColor,
    logoUrl, setLogoUrl,
    theme, setTheme,
    saveSettings,
  } = useTheme();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSettings();
      alert('Settings saved');
    } catch (error) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Appearance Settings</h1>
      <p className="text-gray-600 mb-6">Customize how the platform looks for you.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Primary Color</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-10 border"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="border p-2 rounded flex-1"
              placeholder="#6366f1"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Logo URL (optional)</label>
          <input
            type="url"
            value={logoUrl || ''}
            onChange={(e) => setLogoUrl(e.target.value || null)}
            className="border p-2 rounded w-full"
            placeholder="https://example.com/logo.png"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}