import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Agentic AI',
  description: 'Build and deploy AI agents',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-6xl mx-auto flex gap-6">
            <a href="/" className="font-bold">Agentic AI</a>
            <a href="/agents">Agents</a>
            <a href="/marketplace">Marketplace</a>
            <a href="/dashboard">Dashboard</a>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}
