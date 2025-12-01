import { useState } from 'react'
import SplitText from './reactbits/SplitText'
import AnimatedContent from './reactbits/AnimatedContent'
import { useNavigate } from 'react-router-dom'

const FeaturesSection = () => {
  const navigate = useNavigate()

  const features = [
    {
      title: 'Adaptive Feedback',
      subtitle: "We use AI to analyze a learner's response and suggest a new set of questions to train weak points.",
      link: '/adaptive-feedback'
    },
    {
      title: 'Clinically-Proven Content',
      subtitle: 'We understand that medical content online might not always be correct, which is why our content has been approved by medical professionals, clinicians, and professors.',
      link: '/clinically-proven-content'
    },
    {
      title: 'Learning Environment',
      subtitle: "Teachers and parents can create classrooms and teach students biology using our pre-med course effectively. We've received positive feedback from homeschool groups and institutions.",
      link: '/learning-environment'
    }
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <SplitText
            text="We have loads more to offer"
            className="text-4xl sm:text-5xl font-semibold text-white"
            delay={100}
            duration={0.6}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
        </div>

        {/* Section Subtitle */}
        <p className="text-center text-gray-300 text-lg mb-16 max-w-2xl mx-auto">
          We easily outperform and do better than the next "medical duolingo" copy.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <AnimatedContent
              key={index}
              distance={150}
              direction="vertical"
              reverse={false}
              duration={1.2}
              ease="bounce.out"
              initialOpacity={0.2}
              animateOpacity
              scale={1.1}
              threshold={0.2}
              delay={0.3 * index}
            >
              <FeatureCard
                title={feature.title}
                subtitle={feature.subtitle}
                link={feature.link}
                onNavigate={() => navigate(feature.link)}
              />
            </AnimatedContent>
          ))}
        </div>
      </div>
    </section>
  )
}

const FeatureCard = ({ title, subtitle, onNavigate }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      onClick={onNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-gray-900 p-6 rounded-lg cursor-pointer transition-all duration-300 ${
        isHovered ? 'border-2 border-curare-blue' : 'border-2 border-transparent'
      }`}
    >
      <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
      <p className="text-gray-400 mb-4">{subtitle}</p>
      <p
        className={`transition-colors duration-300 ${
          isHovered ? 'text-curare-blue' : 'text-gray-500'
        }`}
      >
        Learn More →
      </p>
    </div>
  )
}

export default FeaturesSection

