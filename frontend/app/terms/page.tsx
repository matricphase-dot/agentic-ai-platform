import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-5xl font-black mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: April 2026</p>
        
        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Acceptance</h2>
            <p>By accessing or using AgenticAI, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Service Description</h2>
            <p>AgenticAI provides a decentralized platform for deploying, discovering, and interacting with AI agents. This includes compute nodes, staking mechanisms, and API integrations. Services are provided "as is" without any warranty.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree not to use the service for any illegal or unauthorized purpose.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Payments and Refunds</h2>
            <p>Platform usage requires credits or tokens. All payments are non-refundable unless otherwise required by law. We reserve the right to change our pricing at any time with prior notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are owned by AgenticAI and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
            <p>We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p>If you have any questions about these Terms, please contact us at legal@agenticai.dev.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
