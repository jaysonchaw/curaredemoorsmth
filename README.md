# Curare Website

A modern, single-page website for Curare - Revolutionizing Medical Education.

## Features

- **Modern Design**: Sleek, startup-style look with smooth animations
- **ReactBits Integration**: Uses GlassSurface, SplitText, GlareHover, and AnimatedContent components
- **Responsive Layout**: Works seamlessly on desktop and mobile devices
- **Single-Page Layout**: Smooth scrolling between sections
- **Article Pages**: Three detailed feature articles with clean, readable layouts

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- ReactBits (@appletosolutions/reactbits)
- Framer Motion (for additional animations if needed)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Navigation.jsx          # Top navigation bar with Access Code button
│   ├── AccessCodeModal.jsx     # Modal for access code input
│   ├── HeroSection.jsx         # Hero section with animated header
│   ├── WaitlistSignup.jsx      # Waitlist signup form
│   ├── FeaturesSection.jsx     # Three feature cards section
│   └── Footer.jsx              # Footer with social links
├── pages/
│   ├── HomePage.jsx            # Main homepage
│   ├── AdaptiveFeedbackArticle.jsx
│   ├── ClinicallyProvenContentArticle.jsx
│   └── LearningEnvironmentArticle.jsx
├── App.jsx                     # Main app with routing
├── main.jsx                    # Entry point
└── index.css                   # Global styles with Tailwind
```

## Design Specifications

- **Primary Color**: #2563eb (blue)
- **Background**: White (#ffffff) and Black (#000000) for contrast
- **Animations**: All animations use ReactBits components
- **Typography**: Modern, clean fonts with proper hierarchy

## Components Used

### GlassSurface
Used for the Access Code button in the navigation bar. Creates a glass-like, textured effect with blue tint and glow.

### SplitText
Used for animated headers. Letters fade in and move upward sequentially as sections enter view.

### GlareHover
Applied to the Waitlist button. Creates a white glare effect that sweeps across on hover.

### AnimatedContent
Wraps feature cards to create slide-in animations with bounce effects as users scroll.

## Google Form Integration

The waitlist signup form redirects to:
https://docs.google.com/forms/d/e/1FAIpQLSe2IvplhauXDQYrOAtTSaqYGW1kCcz7B9lf2SQTGJHrTGXA2Q/viewform?usp=header

## Social Media Links

- Facebook: facebook.com/profile.php?id=61582441780279
- Instagram: instagram.com/learnwithcurare
- X (Twitter): x.com/learnwithcurare
- YouTube: youtube.com/@learnwithcurare

## License

© 2025 Curare. All Rights Reserved.

