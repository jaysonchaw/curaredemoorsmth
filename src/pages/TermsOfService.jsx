import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pt-32">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-curare-blue hover:text-blue-700 mb-8 transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Simple Terms of Service
          </h1>
          <p className="text-gray-600 text-sm mb-2">Effective date: November 21, 2025</p>
          <p className="text-gray-600 text-sm mb-2">Service name: Curare</p>
          <p className="text-gray-600 text-sm">Contact: curareofficial@gmail.com</p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              1. Quick summary
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These simple terms explain the basic rules for using Curare. They are short and written plainly. They are not a replacement for a full legal contract. If you are a parent or teacher, please read and keep a copy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              2. Who can use the service
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>The service is intended for children with parent or guardian consent.</li>
              <li>Parents or guardians must create or approve accounts for minors.</li>
              <li>If you are under the required age in your region, you must have parent permission to use the platform.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              3. Your account and basic rules
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Use your own information and a parent email for account setup.</li>
              <li>Protect your password and do not share it widely.</li>
              <li>Do not try to access other users accounts or alter platform data.</li>
              <li>Be respectful. Do not upload hateful or abusive content.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              4. Content and intellectual property
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Curare owns the platform content and curriculum unless otherwise stated.</li>
              <li>You are allowed to use the platform content for teaching and personal learning during the pilot.</li>
              <li>Do not copy, reproduce, or republish the content without permission.</li>
              <li>If you submit feedback, you grant Curare a non exclusive right to use that feedback to improve the service.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              5. Pilot and reporting permissions
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>By joining a pilot you agree that anonymised, aggregated metrics may be used in internal and grant reports.</li>
              <li>If you agree to provide a short testimonial or quote, we will confirm the exact wording with you first.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              6. Termination and deletion
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>You or a parent may request account deletion at any time.</li>
              <li>Curare may suspend or remove accounts that violate these rules or its safety policies.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              7. Disclaimers and liability (plain)
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>We try to keep content correct and safe, but we are not a replacement for professional medical advice or training. Lessons are for basic skills only.</li>
              <li>The service is provided as is. We are not liable for indirect damages or for outcomes from following general learning activities on the site.</li>
              <li>For legal or medical emergencies, always contact a qualified professional.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              8. Changes to the terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update these terms. We will publish the updated date and notify pilot contacts by email when changes are significant.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              9. Contact and support
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Questions or problems: email curareofficial@gmail.com.
            </p>
          </section>

          <section className="mb-8 mt-12 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600 text-sm italic">
              This is a simple, plain language summary for pilots. It is not a legally binding contract and not legal advice. For formal legal protections consult a qualified lawyer.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  )
}

export default TermsOfService

