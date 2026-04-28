import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center border-b border-white/5 bg-[#0a0a0a]">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-black">AI</div>
        <span className="text-xl font-black tracking-tighter text-white">AgenticAI</span>
      </Link>
      <Link href="/marketplace" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">Marketplace</Link>
    </nav>
  );
}
