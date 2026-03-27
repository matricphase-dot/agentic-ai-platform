import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="p-6 overflow-auto">{children}</main>
          </div>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
