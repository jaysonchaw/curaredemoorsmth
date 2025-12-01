import SplitText from './reactbits/SplitText'
import GlareHover from './reactbits/GlareHover'
import ButtonTemplate from './ButtonTemplate'

const HeroSection = () => {
  const handleWaitlistClick = () => {
    const waitlistSection = document.getElementById('waitlist-signup')
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Header */}
        <div className="mb-6">
          <SplitText
            text="Revolutionizing Medical Education"
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-black"
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

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Medical education was never meant to be grueling or boring. You're saving lives after all.
        </p>

        {/* Waitlist Button */}
        <div className="flex justify-center">
          <GlareHover
            glareColor="#ffffff"
            glareOpacity={0.3}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
            playOnce={false}
          >
            <ButtonTemplate
              variant="button1"
              text="Join Waitlist"
              textColor="white"
              onClick={handleWaitlistClick}
              className="w-auto"
              style={{ width: '200px', height: 'auto' }}
            />
          </GlareHover>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

