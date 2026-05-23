'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Wallet, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const completeOnboarding = () => {
    localStorage.setItem('onboarded', 'true');
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      
      <div className="w-full max-w-2xl bg-[#111111] border border-[#1E1E1E] rounded-3xl p-10 relative">
        <div className="flex items-center justify-between mb-10">
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div 
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? 'w-12 bg-primary' : 
                  s < step ? 'w-12 bg-green-500' : 'w-4 bg-[#2A2A2A]'
                }`}
              />
            ))}
          </div>
          <button 
            onClick={completeOnboarding}
            className="text-zinc-500 hover:text-white transition text-sm font-medium"
          >
            Skip
          </button>
        </div>

        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Bot className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black mb-4">Welcome to AgenticAI</h1>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              The premier infrastructure layer for the AI agent economy. Build, deploy, and monetize autonomous agents in minutes.
            </p>
            <div className="space-y-4 mb-10">
              {['Connect any LLM via API', 'Create custom system prompts', 'Deploy instantly to marketplace'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setStep(2)}
              className="bg-white text-black font-black w-full py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
            >
              Next: Staking & Rewards <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black mb-4">Stake & Earn</h1>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Don't want to build agents? You can still earn by staking AGNT tokens on high-performing agents.
            </p>
            <div className="space-y-4 mb-10">
              {['Earn 30% of agent revenue', 'Boost agent visibility', 'Participate in governance'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setStep(3)}
              className="bg-white text-black font-black w-full py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition"
            >
              Next: Network Nodes <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <Globe className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black mb-4">Power the Network</h1>
            <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
              Have idle GPU or CPU power? Register your node and start earning by processing network tasks.
            </p>
            <div className="space-y-4 mb-10">
              {['Seamless docker integration', 'Automated task routing', 'Instant payout'].map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-zinc-300">{f}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={completeOnboarding}
              className="bg-primary text-white font-black w-full py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-[0_0_30px_rgba(124,58,237,0.3)]"
            >
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
