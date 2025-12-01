import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const ClinicallyProvenContentArticle = () => {
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
          <p className="text-gray-500 text-sm mb-2">November 2025</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Clinically-Proven Content
          </h1>
          <p className="text-gray-600">By Jayson Chaw</p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Why clinical proof matters:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Medical content on the internet varies wildly. For young learners, accuracy is not optional. Curare builds curriculum that is reviewed and approved by medical professionals, clinicians, and university professors so every lesson is safe, age-appropriate, and pedagogically solid.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              How we build and verify content:
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed">
              <li>
                <strong>Evidence-first drafting.</strong> Each lesson starts with a short syllabus referencing basic clinical standards and educational goals.
              </li>
              <li>
                <strong>Clinical review.</strong> A practicing clinician checks clinical accuracy and flags parts that require simplified language for children.
              </li>
              <li>
                <strong>Academic validation.</strong> A medical educator or professor reviews the learning objectives and assessment design to ensure the lesson measures what it claims.
              </li>
              <li>
                <strong>Iterative pilot testing.</strong> Lessons run in small pilots and are revised based on teacher feedback and learning outcomes.
              </li>
              <li>
                <strong>Versioned publishing.</strong> Every content version is dated and stored, so reviewers can track changes and reproduce pilot conditions.
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Examples of checks we run:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Safety checks for any hands-on activity to ensure no hazardous steps are required.</li>
              <li>Language audits to remove jargon or medical terms that confuse younger learners.</li>
              <li>Clinical alignment checks to verify that procedures match accepted first-aid or basic medical guidelines for non-clinical settings.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Why funders and schools trust this:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Grant reviewers and pilot partners want to see evidence of clinical oversight. We provide reviewer names, short bios, and a summary of the review notes with each lesson. That transparency makes it simple for institutions to accept the content for their learners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              How we handle sensitive topics:
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We do not collect or publish sensitive health data. Lessons stress universal safety steps and practical skills without requiring medical diagnoses or personal health records. For modules that touch on health behaviors, we include parental guidance notes and optional teacher scripts.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  )
}

export default ClinicallyProvenContentArticle

