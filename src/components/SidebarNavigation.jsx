import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { removeSessionToken } from '../utils/cookieManager'

const SidebarNavigation = ({ isLightMode = false }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState(null)
  const [moreDropdownHovered, setMoreDropdownHovered] = useState(false)
  const [moreItemHovered, setMoreItemHovered] = useState(null)

  // Determine which item is selected based on current route
  const getSelectedItem = () => {
    if (location.pathname === '/testsecurev2' || location.pathname.startsWith('/testsecurev2/lesson') || location.pathname.startsWith('/testsecurev2/practice') || location.pathname.startsWith('/testsecurev2/unit') || location.pathname === '/' || location.pathname.startsWith('/lesson') || location.pathname.startsWith('/practice') || location.pathname.startsWith('/unit')) {
      return 'home'
    }
    if (location.pathname === '/more' || location.pathname.startsWith('/more') || location.pathname === '/settings' || location.pathname.startsWith('/settings')) {
      return 'more'
    }
    return null
  }

  const selectedItem = getSelectedItem()

  const menuItems = [
    {
      id: 'home',
      label: 'LEARN',
      icon: '/homeicon.png',
      selectedIcon: '/homeiconselected.png',
      onClick: () => navigate('/testsecurev2')
    },
    {
      id: 'more',
      label: 'MORE',
      icon: '/moreicon.png',
      selectedIcon: '/moreiconselected.png',
      onClick: null // No click, only hover
    }
  ]

  const moreDropdownItems = [
    { id: 'schools', label: 'SCHOOLS', onClick: () => {} }, // Non-functioning
    { id: 'settings', label: 'SETTINGS', onClick: () => navigate('/settings') },
    { id: 'logout', label: 'LOG OUT', onClick: () => {
      // Handle logout - clear all user data
      removeSessionToken()
      localStorage.removeItem('user')
      // Clear age and onboarding responses
      localStorage.removeItem('curare_user_age')
      sessionStorage.removeItem('welcomeResponses')
      sessionStorage.clear()
      navigate('/')
    }}
  ]

  return (
    <div style={{
      position: 'fixed',
      left: '32px', // Slightly to the left for better comfort
      top: '120px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      zIndex: 1000,
      pointerEvents: 'auto',
      width: '200px' // Width to align right edge with logo right edge
    }}>
      {menuItems.map((item) => {
        const isSelected = selectedItem === item.id
        const isHovered = hoveredItem === item.id
        const isMoreItem = item.id === 'more'

        return (
          <div
            key={item.id}
            onClick={item.onClick || undefined}
            onMouseEnter={() => {
              setHoveredItem(item.id)
              if (isMoreItem) {
                setMoreDropdownHovered(true)
              }
            }}
            onMouseLeave={() => {
              setHoveredItem(null)
              if (isMoreItem) {
                setMoreDropdownHovered(false)
                setMoreItemHovered(null)
              }
            }}
            style={{
              position: 'relative',
              cursor: isMoreItem ? 'default' : 'pointer',
              width: '100%' // Make items full width of container
            }}
          >
            {/* Background fill - behind everything */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '8px',
                backgroundColor: isSelected 
                  ? (isLightMode ? '#a8c3ffff' : '#0c2969')
                  : isHovered 
                    ? (isLightMode ? '#e3e3e3ff' : '#29323c')
                    : 'transparent',
                transition: 'background-color 0.2s ease',
                zIndex: 0
              }}
            />
            {/* Border and content container - on top of fill */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: isSelected 
                  ? '2px solid #2563ebff' 
                  : '2px solid transparent',
                transition: 'all 0.2s ease',
                zIndex: 1
              }}
            >
              {/* Icon and text */}
              <img
                src={isSelected 
                  ? item.selectedIcon 
                  : (isLightMode 
                      ? (item.id === 'quests' 
                          ? '/questsicon(light2).png'
                          : item.icon.replace('.png', '(light2).png'))
                      : item.icon)}
                alt={item.label}
                style={{
                  width: '23px',
                  height: '23px',
                  flexShrink: 0
                }}
              />
              <span
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isSelected ? '#2563ebff' : (isLightMode ? '#000000' : 'white'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  transition: 'color 0.2s ease'
                }}
              >
                {item.label}
              </span>
            </div>
            
            {/* MORE Dropdown */}
            {isMoreItem && moreDropdownHovered && (
              <div
                onMouseEnter={() => setMoreDropdownHovered(true)}
                onMouseLeave={() => {
                  setMoreDropdownHovered(false)
                  setMoreItemHovered(null)
                }}
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: 0,
                  marginLeft: '4px', // Small gap to prevent overlap
                  zIndex: 1001
                }}
              >
                {/* Invisible safe zone wrapper - extends hover area */}
                <div
                  style={{
                    padding: '16px', // Safe zone padding
                    margin: '-16px' // Negative margin to extend hover area
                  }}
                >
                  {/* Actual dropdown panel */}
                  <div
                    style={{
                      backgroundColor: isLightMode ? '#ffffff' : '#29323c',
                      borderRadius: '8px',
                      padding: '8px 0',
                      minWidth: '200px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      border: `2px solid ${isLightMode ? '#e3e3e3' : '#3b4652'}` // Match tab border width
                    }}
                  >
                    {moreDropdownItems.map((dropdownItem) => (
                      <div
                        key={dropdownItem.id}
                        onClick={dropdownItem.onClick}
                        onMouseEnter={() => setMoreItemHovered(dropdownItem.id)}
                        onMouseLeave={() => setMoreItemHovered(null)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          backgroundColor: moreItemHovered === dropdownItem.id 
                            ? (isLightMode ? '#e3e3e3' : '#3b4652')
                            : 'transparent',
                          transition: 'background-color 0.2s ease'
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: '14px',
                            fontWeight: 700,
                            color: isLightMode ? '#000000' : '#ffffff',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {dropdownItem.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default SidebarNavigation

