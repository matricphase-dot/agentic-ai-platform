import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agentic AI Platform",
  description: "The operating system for the post-human economy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-900 text-white p-4">
  <div className="container mx-auto flex gap-6 flex-wrap">
    <Link href="/" className="hover:text-blue-300">Home</Link>
    <Link href="/dashboard" className="hover:text-blue-300">Dashboard</Link>
    <Link href="/self-evolving" className="hover:text-blue-300">Self-Evolving</Link>
    <Link href="/staking" className="hover:text-blue-300">Staking</Link>
    <Link href="/governance" className="hover:text-blue-300">Governance</Link>
    <Link href="/nodes" className="hover:text-blue-300">Nodes</Link>
    <Link href="/platforms" className="hover:text-blue-300">Platforms</Link>
    <Link href="/venture" className="hover:text-blue-300">Venture</Link>
    <Link href="/marketplace" className="hover:text-blue-300">Marketplace</Link>
    <Link href="/franchise" className="hover:text-blue-300">Franchise</Link>
    <Link href="/agents" className="hover:text-blue-300">Agents</Link>
    <Link href="/nations" className="hover:text-blue-300">Nations</Link>            <Link href="/moats" className="hover:text-blue-300">Moats</Link>
            
            </div>
</nav>
        {children}
      </body>
    </html>
  );
}




















