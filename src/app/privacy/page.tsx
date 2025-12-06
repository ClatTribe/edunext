// app/privacy/page.js  OR  pages/privacy.js

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
        <p>We collect information you provide directly to us, including your name, email address, and profile information when you sign in with Google.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Provide, maintain, and improve our services</li>
          <li>Send you technical notices and support messages</li>
          <li>Respond to your comments and questions</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
        <p>We do not share your personal information with third parties except as described in this policy.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
        <p>We use industry-standard security measures to protect your information.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Contact Us</h2>
        <p>If you have questions about this Privacy Policy, contact us at: edunextweb@gmail.com</p>
      </section>
    </div>
  );
}