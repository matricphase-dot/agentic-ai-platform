import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="pt-20 pb-10 px-6 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div>
            <h4 className="font-bold uppercase tracking-widest text-primary mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Create Agent</Link></li>
              <li><Link href="/dashboard/staking" className="hover:text-white">Staking</Link></li>
              <li><Link href="/dashboard/governance" className="hover:text-white">Governance</Link></li>
              <li><Link href="/dashboard/nodes" className="hover:text-white">Nodes</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest text-primary mb-6">Developers</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/docs" className="hover:text-white">API Docs</Link></li>
              <li><Link href="#" className="hover:text-white">SDK</Link></li>
              <li><Link href="#" className="hover:text-white">Smart Contracts</Link></li>
              <li><Link href="#" className="hover:text-white">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest text-primary mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="#" className="hover:text-white">Blog</Link></li>
              <li><Link href="#" className="hover:text-white">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase tracking-widest text-primary mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 text-primary rounded-lg flex items-center justify-center font-black">AI</div>
            <span className="text-xl font-black tracking-tighter text-white">AgenticAI</span>
          </div>
          <p className="text-sm text-muted-foreground italic">© 2026 AgenticAI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Twitter</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">Discord</Link>
            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
  );
}
