export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 prose max-w-4xl">
      <h1>Privacy Policy</h1>
      <p><em>Last updated: {new Date().toLocaleDateString()}</em></p>

      <h2>1. Introduction</h2>
      <p>Welcome to Agentic AI Platform. We respect your privacy and are committed to protecting your personal data.</p>

      <h2>2. Data We Collect</h2>
      <ul>
        <li>Account information (email, name, profile picture)</li>
        <li>Agent data you create</li>
        <li>Usage logs and interactions</li>
        <li>Payment information (if any – processed by third parties)</li>
      </ul>

      <h2>3. How We Use Your Data</h2>
      <ul>
        <li>To provide and improve our services</li>
        <li>To communicate with you</li>
        <li>To comply with legal obligations</li>
        <li>With your consent, for marketing purposes</li>
      </ul>

      <h2>4. Your Rights</h2>
      <p>Under GDPR and similar laws, you have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Rectify inaccurate data</li>
        <li>Erase your data (right to be forgotten)</li>
        <li>Restrict or object to processing</li>
        <li>Data portability</li>
      </ul>
      <p>To exercise these rights, visit your <Link href="/settings/privacy" className="text-blue-600">privacy settings</Link> or contact us.</p>

      <h2>5. Data Retention</h2>
      <p>We retain your data as long as your account is active or as needed to provide services. You may delete your account at any time.</p>

      <h2>6. Security</h2>
      <p>We implement appropriate technical and organizational measures to protect your data.</p>

      <h2>7. Changes to This Policy</h2>
      <p>We may update this policy from time to time. We will notify you of significant changes.</p>

      <h2>8. Contact Us</h2>
      <p>If you have questions, email us at privacy@agentic.ai</p>
    </div>
  );
}
