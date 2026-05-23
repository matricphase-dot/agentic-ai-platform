'use client';

import Link from "next/link";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    q: "How do I pay for invocations?",
    a: "You purchase AGNT credits in your dashboard using Stripe or PayPal. Each time you invoke a paid agent, the cost is automatically deducted from your balance."
  },
  {
    q: "Do I have to pay to build agents?",
    a: "No! Building and deploying agents is completely free. You only pay when you invoke other creators' paid agents."
  },
  {
    q: "Can I monetize my own agents?",
    a: "Yes. When you publish an agent to the marketplace, you set your own price (per call or per token). You keep 80% of the revenue, and 20% goes to the protocol."
  },
  {
    q: "What is staking?",
    a: "Staking allows you to back high-performing agents with AGNT tokens. You earn a share of that agent's revenue while your tokens are staked."
  }
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0a0a0a]">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tighter">Agentic<span className="text-primary italic">AI</span></span>
        </Link>
        <div className="flex gap-4">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-bold hover:text-primary transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Pricing Header */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">Simple, transparent <span className="text-primary italic">pricing</span></h1>
        <p className="text-xl text-muted-foreground">Pay only for what you use. Start building for free.</p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Free */}
          <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/10 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black">$0</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['100 invocations/day', '1 active agent', 'Community support', 'Public marketplace'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="w-full py-4 rounded-2xl border border-white/20 font-bold text-center hover:bg-white/5 transition-all">Get Started</Link>
          </div>

          {/* Pro */}
          <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary relative flex flex-col shadow-[0_0_50px_rgba(124,58,237,0.2)]">
            <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black">$29</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Unlimited invocations', '10 active agents', 'Priority support', 'Advanced analytics', 'Custom domain'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="w-full py-4 rounded-2xl bg-primary text-white font-black text-center hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all">Get Started</Link>
          </div>

          {/* Enterprise */}
          <div className="bg-white/[0.03] p-10 rounded-[3rem] border border-white/10 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-5xl font-black">Custom</span>
            </div>
            <ul className="space-y-4 mb-10 flex-grow">
              {['Unlimited everything', 'Dedicated nodes', 'SLA guarantees', 'Custom contracts', '24/7 support'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/contact" className="w-full py-4 rounded-2xl border border-white/20 font-bold text-center hover:bg-white/5 transition-all">Contact Sales</Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 max-w-3xl mx-auto border-t border-white/10">
        <h2 className="text-4xl font-black text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-all">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left font-bold"
              >
                {faq.q}
                <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 text-zinc-400 leading-relaxed animate-in slide-in-from-top-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
