// app/terms/page.js  OR  pages/terms.js

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>By accessing and using EduNext, you accept and agree to be bound by the terms and provision of this agreement.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">2. Use License</h2>
        <p>Permission is granted to temporarily use EduNext for personal, non-commercial transitory viewing only.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">3. User Account</h2>
        <p>You are responsible for maintaining the confidentiality of your account and password.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">4. Privacy</h2>
        <p>Your use of EduNext is also governed by our Privacy Policy.</p>
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-3">5. Contact</h2>
        <p>For questions about these Terms, contact us at: edunextweb@gmail.com</p>
      </section>
    </div>
  );
}