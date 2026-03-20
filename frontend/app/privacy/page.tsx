"use client";

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p>Your privacy is important to us...</p>
      <p>To exercise your rights, visit your <Link href="/settings/privacy" className="text-blue-600">privacy settings</Link> or contact us.</p>
    </div>
  );
}
