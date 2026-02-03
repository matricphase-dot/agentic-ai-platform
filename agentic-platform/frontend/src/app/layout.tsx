// frontend/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar'; // Changed from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agentic AI Platform - WordPress for AI Agents',
  description: 'No-code platform to discover, customize, and deploy AI agents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gray-950 text-white`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="border-t border-gray-800 py-8 mt-12">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-6 md:mb-0">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600"></div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Agentic AI
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm max-w-md">
                    Build and deploy AI agents without code.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-4">Platform</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/marketplace" className="hover:text-blue-400">Marketplace</a></li>
                      <li><a href="/features" className="hover:text-blue-400">Features</a></li>
                      <li><a href="/pricing" className="hover:text-blue-400">Pricing</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-4">Resources</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/docs" className="hover:text-blue-400">Documentation</a></li>
                      <li><a href="/blog" className="hover:text-blue-400">Blog</a></li>
                      <li><a href="/support" className="hover:text-blue-400">Support</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-300 mb-4">Company</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/about" className="hover:text-blue-400">About</a></li>
                      <li><a href="/careers" className="hover:text-blue-400">Careers</a></li>
                      <li><a href="/contact" className="hover:text-blue-400">Contact</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Agentic AI Platform.</p>
              </div>
            </div>
          </footer>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </body>
    </html>
  );
}