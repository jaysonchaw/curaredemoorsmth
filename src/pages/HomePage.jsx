import { useEffect } from 'react'
import Navigation from '../components/Navigation'
import HeroSection from '../components/HeroSection'
import WaitlistSignup from '../components/WaitlistSignup'
import PartnershipSection from '../components/PartnershipSection'
import FeaturesSection from '../components/FeaturesSection'
import Footer from '../components/Footer'

const HomePage = () => {
  useEffect(() => {
    console.log('HomePage mounted')
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <WaitlistSignup />
      <PartnershipSection />
      <FeaturesSection />
      <Footer />
    </div>
  )
}

export default HomePage

