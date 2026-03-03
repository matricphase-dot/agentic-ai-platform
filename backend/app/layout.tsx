import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import NotificationsDropdown from '@/components/Notifications';
import { WebSocketProvider } from '@/lib/websocket';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebSocketProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1">
              <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-end px-6">
                <NotificationsDropdown />
              </header>
              <main className="p-8">{children}</main>
            </div>
          </div>
        </WebSocketProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
