import { Link } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Footer from '../components/Footer'

const AdaptiveFeedbackArticle = () => {
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
            Adaptive Feedback
          </h1>
          <p className="text-gray-600">By Jayson Chaw</p>
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Why adaptive feedback matters:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Most learning tools show a student a question and then move on. That is fine for memorizing facts, but weak for building real skills. Curare uses AI to read how a learner answers, finds the weak points in reasoning or technique, and serves targeted follow-ups that train the exact gaps. The result is faster progress, less frustration, and measurable confidence when learners face practical tasks.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              How it works, in plain terms:
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed">
              <li>The student attempts a short task or quiz item.</li>
              <li>Our AI analyzes the full response, not just right or wrong. It looks at error patterns, timing, and sequence of steps.</li>
              <li>The system chooses from a bank of scaffolded follow-up questions and micro-tasks that focus on the weak sub-skill.</li>
              <li>After the micro-practice, the AI re-tests with a slightly harder item to confirm learning.</li>
              <li>The system logs the improvement so teachers and parents see the learning gain.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Three practical examples:
            </h2>
            <ul className="list-disc list-inside space-y-4 text-gray-700 leading-relaxed">
              <li>
                A learner mislabels parts of a basic anatomy diagram. The AI gives two quick, focused labeling drills, a short matching activity, then a mini-assessment that mixes new and old items.
              </li>
              <li>
                During a first-aid task, a student omits a safety step. The platform serves a short interactive scenario where safety steps are the main focus before replaying the full task.
              </li>
              <li>
                In a quiz about vital signs, the system notices slow response time. It serves timed practice to build fluency, not just accuracy.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Why this beats one-size-fits-all quizzes:
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Adaptive feedback reduces wasted practice time. Instead of repeating whole units, learners get what they specifically need. That means higher retention, better transfer to real tasks, and clearer evidence to show in pilot reports.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              What teachers and parents get:
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 leading-relaxed">
              <li>A per-student learning path showing which sub-skills improved and which still need work.</li>
              <li>Suggested micro-lessons teachers can assign in minutes.</li>
              <li>Exportable progress notes for report cards or pilot summaries.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-4">
              Safety and transparency:
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The AI rules are transparent and configurable. Teachers can review the question bank, edit the scaffolds, and turn off automated hints. Data used for adaptation is anonymized for reporting unless explicit consent is given.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  )
}

export default AdaptiveFeedbackArticle

