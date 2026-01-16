import { getLessonContent } from '../data/lessons/lessonContentLoader'

const LessonContent = ({ lessonId, sourcesSectionRef, isLightMode = false }) => {
  const content = getLessonContent(lessonId)
  
  if (!content) return null

  const renderSection = (section, index) => {
    switch (section.type) {
      case 'paragraph':
        return (
          <p
            key={index}
            style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '12pt',
              color: isLightMode ? '#000000' : 'white',
              lineHeight: '1.6',
              marginTop: index === 0 ? '20px' : '16px',
              marginBottom: '0',
              fontWeight: 400
            }}
          >
            {section.content}
          </p>
        )
      
      case 'image':
        return (
          <div key={index} style={{ position: 'relative', marginTop: index === 0 ? '0' : '20px' }}>
            <img
              src={section.src}
              alt={section.alt}
              style={{
                width: '96%',
                height: 'auto',
                marginTop: '20px',
                display: 'block'
              }}
            />
            <div
              style={{
                width: 'calc(100% - 0px)',
                height: '1px',
                backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
                marginTop: '16px',
                marginLeft: '0',
                marginRight: '0',
                marginBottom: '0'
              }}
            />
            <p style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: '8pt',
              color: isLightMode ? '#d0d1d2' : '#3b4652',
              marginTop: '12px',
              marginBottom: '0',
              fontWeight: 400
            }}>
              {section.caption}
            </p>
          </div>
        )
      
      case 'bullets':
        return (
          <ul
            key={index}
            style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '12pt',
              color: isLightMode ? '#000000' : 'white',
              lineHeight: '1.6',
              marginTop: '20px',
              marginBottom: '0',
              fontWeight: 400,
              paddingLeft: '20px',
              listStyleType: 'disc'
            }}
          >
            {section.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                style={{ marginBottom: itemIndex === section.items.length - 1 ? '0' : '12px' }}
              >
                {item}
              </li>
            ))}
          </ul>
        )
      
      default:
        return null
    }
  }

  return (
    <>
      <div style={{ position: 'relative' }}>
        {content.sections.map((section, index) => {
          // Group first paragraph and first image together
          if (index === 0 || (index === 1 && content.sections[0].type === 'paragraph' && section.type === 'image')) {
            return (
              <div key={index} style={{ position: 'relative' }}>
                {renderSection(section, index)}
              </div>
            )
          }
          // Group bullets and following image together
          if (section.type === 'bullets' || (section.type === 'image' && index > 0 && content.sections[index - 1].type === 'bullets')) {
            return (
              <div key={index} style={{ position: 'relative', marginTop: section.type === 'bullets' ? '20px' : '0' }}>
                {renderSection(section, index)}
              </div>
            )
          }
          // Standalone paragraphs
          return (
            <div key={index} style={{ marginTop: '20px' }}>
              {renderSection(section, index)}
            </div>
          )
        })}
      </div>
      
      {/* Sources Section */}
      {content.sources && content.sources.length > 0 && (
        <div ref={sourcesSectionRef}>
          <div
            style={{
              width: 'calc(100% - 0px)',
              height: '1px',
              backgroundColor: isLightMode ? '#d0d1d2' : '#3b4652',
              marginTop: '20px',
              marginLeft: '0',
              marginRight: '0',
              marginBottom: '0'
            }}
          />
          <div style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: '10px',
            fontWeight: 700,
            color: isLightMode ? '#000000' : 'white',
            marginTop: '16px',
            marginBottom: '12px'
          }}>
            Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {content.sources.map((source, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <img
                  src={source.favicon}
                  alt={source.name}
                  style={{
                    width: '20px',
                    height: '20px',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Inter Tight', sans-serif",
                    fontSize: '10px',
                    fontWeight: 700,
                    color: isLightMode ? '#000000' : 'white',
                    marginBottom: '4px'
                  }}>
                    {source.name}
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: '10px',
                      fontWeight: 400,
                      color: isLightMode ? '#000000' : 'white',
                      textDecoration: 'none',
                      display: 'block',
                      wordBreak: 'break-all'
                    }}
                    onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    {source.url}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default LessonContent

