// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

// ✅ Use your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '69453273224-nq9qnuc3rvhcocvanov1ljvom334mf52.apps.googleusercontent.com'

console.log('🔑 Google Client ID:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)