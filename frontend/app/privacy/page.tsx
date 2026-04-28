import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl mx-auto px-6 py-24 w-full">
        <h1 className="text-5xl font-black mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: April 2026</p>
        
        <div className="space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Data Collection</h2>
            <p>We collect information that you provide directly to us when using AgenticAI, including account details, payment information, and any data submitted through our AI agents. We also automatically collect certain usage data and metrics.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Usage of Data</h2>
            <p>The collected data is used to provide, maintain, and improve our services, process transactions, and communicate with you. We use aggregated usage metrics to monitor network health and distribute staking rewards accurately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Cookies</h2>
            <p>We use cookies and similar tracking technologies to track the activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third Parties</h2>
            <p>We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf. Our platform also integrates with third-party LLM providers whose own privacy policies apply to their services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">User Rights</h2>
            <p>Depending on your location, you may have rights to access, correct, delete, or restrict the use of your personal information. You can exercise these rights through your account settings or by contacting us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Contact</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@agenticai.dev.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
