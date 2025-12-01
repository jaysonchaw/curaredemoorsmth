import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const LearningEnvironmentArticle = () => {
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
            Learning Environment
          </h1>
          <p className="text-gray-600">By Jayson Chaw</p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              What this is, and why it matters:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Curare is not just a set of modules. It is a learning environment where parents and teachers create classrooms, assign pre-med courses, and track real progress. For homeschool groups and small institutions, this means a single place to run lessons, manage students, and measure outcomes without piecing together multiple tools.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Key features that make teaching easy:
            </h2>
            <ul className="list-disc list-inside space-y-3 text-gray-700 leading-relaxed">
              <li>
                <strong>Classroom creation.</strong> Teachers or parents create virtual classrooms in two clicks. Add students, set access dates, and assign specific modules.
              </li>
              <li>
                <strong>Role-based access.</strong> Teachers get dashboards, parents get family views, and students get a focused learning interface.
              </li>
              <li>
                <strong>Assignment and pacing controls.</strong> Instructors can assign modules or allow self-paced access, and set deadlines with gentle reminders.
              </li>
              <li>
                <strong>Simple gradebook.</strong> The platform captures pre/post quiz data and shows per-student improvement so teachers can prioritize interventions.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              How it supports real classroom practice:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Curare's course maps align modules into short units that fit weekly sessions. Teachers can print lesson notes, preview student answers, and export anonymized class reports. For homeschool groups, that translates to measurable enrichment sessions parents can include in progress portfolios.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Practical success stories:
            </h2>
            <ul className="list-disc list-inside space-y-4 text-gray-700 leading-relaxed">
              <li>
                <strong>Homeschool group pilot.</strong> A local homeschool group ran a 4-week pilot with 10 students and reported measurable gains in confidence and skill on basic first-aid tasks. They appreciated the built-in certificates and one-page results summary for parents.
              </li>
              <li>
                <strong>Small institution rollout.</strong> An enrichment centre used the assignment controls to run weekend workshops, and teachers used the dashboards to identify students who needed extra practice.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Teacher-friendly extras:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>Ready-to-use lesson scripts for live sessions.</li>
              <li>Printable handouts and assessment sheets.</li>
              <li>A short training video for parents and coordinators to speed onboarding.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Data and reporting for grants and pilots:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We provide exportable CSVs and a one-page pilot summary that show activation rates, average session time, retention, and learning gain. Those outputs are formatted for inclusion in grant applications and funder reports.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Privacy and classroom safety:
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Student accounts are minimal and tied to parent emails. Teachers can anonymize reports for external sharing. We provide parental consent templates and clear guidance on data handling.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  )
}

export default LearningEnvironmentArticle

