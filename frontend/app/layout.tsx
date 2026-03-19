import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from './auth-provider';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Agentic AI',
  description: 'Build and deploy AI agents',
};

const OnboardingTour = dynamic(
  () => import('@/components/OnboardingTour'),
  { ssr: false }
);

export default function RootLayout({
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);

  if (hasError) {
    return <div>Something went wrong. Please refresh.</div>;
  }
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            <Layout>{children}</Layout>
            <OnboardingTour />
          </AuthProvider>
        </ThemeProvider>
                </ErrorBoundary>
          </body>
    </html>
  );
}



