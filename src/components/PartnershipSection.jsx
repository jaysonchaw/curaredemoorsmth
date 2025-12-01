import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const PartnershipSection = () => {
  const [isPaused, setIsPaused] = useState(false)
  const containerRef = useRef(null)
  const scrollRef = useRef(null)

  // Sample partnership logos - replace with actual partner logos
  const partners = [
    { name: 'Partner 1', logo: '/logo.png' },
    { name: 'Partner 2', logo: '/logo.png' },
    { name: 'Partner 3', logo: '/logo.png' },
    { name: 'Partner 4', logo: '/logo.png' },
    { name: 'Partner 5', logo: '/logo.png' },
    { name: 'Partner 6', logo: '/logo.png' },
  ]

  // Duplicate partners for seamless loop
  const duplicatedPartners = [...partners, ...partners]

  return (
    <section 
      className="py-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#0034a7' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
            Trusted by Leading Organizations
          </h2>
          <button 
            className="text-white text-sm font-medium hover:underline opacity-80 hover:opacity-100 transition-opacity"
            disabled
          >
            <a href="/for-schools" className="text-white hover:text-blue-200 transition-colors">
              Learn More
            </a>
          </button>
        </div>

        <div 
          ref={containerRef}
          className="overflow-hidden"
          style={{ 
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
          }}
        >
          <motion.div
            ref={scrollRef}
            className="flex gap-8 items-center"
            animate={{
              x: isPaused ? 0 : ['0%', '-50%'],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: 'loop',
                duration: 30,
                ease: 'linear',
              },
            }}
            style={{ width: 'max-content' }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: '200px', height: '100px' }}
              >
                <div className="bg-white rounded-lg p-4 w-full h-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default PartnershipSection

