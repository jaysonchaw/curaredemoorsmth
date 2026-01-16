import React, { useState } from 'react'
import SidebarNavigation from '../components/SidebarNavigation'
import { getInitialLightMode } from '../utils/lightModeInit'

const Quests = () => {
  const [isLightMode, setIsLightMode] = useState(getInitialLightMode)

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: isLightMode ? '#ffffff' : '#161d25ff',
      position: 'relative',
      overflowX: 'visible'
    }}>
      {/* Left Sidebar - Fixed */}
      <div style={{
        position: 'sticky',
        top: '0px',
        alignSelf: 'start',
        width: '200px',
        height: 'auto',
        pointerEvents: 'none',
        zIndex: 100,
        marginLeft: '120px',
        overflow: 'visible',
        gridColumn: '1'
      }}>
        <div style={{
          position: 'fixed',
          top: '40px',
          left: '40px',
          zIndex: 1001,
          pointerEvents: 'auto',
          width: 'auto',
          height: 'auto'
        }}>
          <img
            src="/logo.svg"
            alt="Logo"
            style={{
              height: '40.8px',
              width: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 0 0 transparent)'
            }}
          />
        </div>
        <div style={{
          position: 'fixed',
          left: '280px',
          top: '0px',
          width: '2px',
          height: '100vh',
          backgroundColor: isLightMode ? '#d0d1d2' : '#4a5568',
          zIndex: 99
        }} />
        <SidebarNavigation isLightMode={isLightMode} />
      </div>
    </div>
  )
}

export default Quests

