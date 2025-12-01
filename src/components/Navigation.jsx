import { useState } from 'react'
import { Link } from 'react-router-dom'
import GlassSurface from './reactbits/GlassSurface'
import AccessCodeModal from './AccessCodeModal'

const Navigation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <img 
                  src="/logo.png" 
                  alt="Curare" 
                  style={{ height: '68px' }}
                  className="w-auto"
                />
              </Link>
            </div>

            {/* Access Code Button */}
            <div className="flex-shrink-0">
              <GlassSurface
                borderRadius={20}
                style={{ 
                  backgroundColor: '#2563eb',
                  cursor: 'pointer',
                  minWidth: '140px',
                  height: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setIsModalOpen(true)}
              >
                <span className="text-white font-medium">Access Code</span>
              </GlassSurface>
            </div>
          </div>
        </div>
      </nav>

      <AccessCodeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}

export default Navigation

