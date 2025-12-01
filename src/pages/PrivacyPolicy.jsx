import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const PrivacyPolicy = () => {
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
            Simple Privacy Policy
          </h1>
          <p className="text-gray-600 text-sm mb-2">Effective date: November 21, 2025</p>
          <p className="text-gray-600 text-sm mb-2">Service name: Curare</p>
          <p className="text-gray-600 text-sm">Contact: curareofficial@gmail.com</p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              1. What this covers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              This privacy policy explains what information Curare collects from users during the pilot and normal use, why we collect it, how we use it, and how you can contact us. It is written in plain language so parents and teachers can understand it quickly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              2. Information we collect
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect only the minimal information needed to provide the service and measure pilot results:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li><strong>Account info:</strong> child first name, age, and parent email for account setup.</li>
              <li><strong>Usage data:</strong> modules completed, session timestamps, time spent, quiz scores, and basic engagement events.</li>
              <li><strong>Pilot metadata:</strong> org name, access key used, signup and activation dates.</li>
              <li><strong>Optional feedback:</strong> teacher or parent survey responses and anonymous quotes if you allow it.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              We do not collect medical records or sensitive health data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              3. Why we collect it
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We collect this information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Let students sign up and use the platform.</li>
              <li>Measure learning outcomes during pilots.</li>
              <li>Improve the product and fix bugs.</li>
              <li>Produce anonymised pilot reports for schools and funders.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              4. How we use and share data
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>We use data internally to run the service and create anonymised reports.</li>
              <li>We will never publish student names or identifying details in public materials.</li>
              <li>We may share anonymised, aggregated pilot results with partners, funders, or in grant applications.</li>
              <li>We will not sell personal data.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              5. Parental consent and minors
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Because our users include children, a parent or legal guardian must provide consent during pilot sign up. Parents may:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Review the data we store about their child.</li>
              <li>Request deletion of their child account and data.</li>
              <li>Opt out of their child being included in aggregated reports.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              To request deletion or ask questions, email curareofficial@gmail.com.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              6. Data retention and deletion
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We keep pilot data for the period needed to evaluate the pilot and to improve the product, normally no longer than 12 months unless you ask us to delete it sooner. Parents can request deletion at any time.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              7. Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We store data on secure servers and use reasonable technical steps to protect it. No system is perfect. If a security issue occurs we will notify affected users and take corrective action.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              8. Cookies and tracking
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We use basic cookies or similar tools to keep sessions working and to collect anonymous analytics. These are not used to identify children.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              9. Changes to this policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this simple policy. If we make material changes we will publish the new policy and email pilot contacts. The policy version with the most recent Effective date applies.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              10. Contact
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Questions, deletion requests, or privacy concerns: email curareofficial@gmail.com.
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

export default PrivacyPolicy

