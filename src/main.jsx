import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import App from './App.jsx'
import './index.css'

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  console.log('Root element found, mounting React app...')
  
  // Only wrap with reCAPTCHA provider if site key is configured
  if (RECAPTCHA_SITE_KEY) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
          <App />
        </GoogleReCaptchaProvider>
      </React.StrictMode>,
    )
  } else {
    console.warn('reCAPTCHA site key not configured - running without reCAPTCHA')
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  }
}

