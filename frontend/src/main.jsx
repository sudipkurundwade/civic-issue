import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from './components/ui/toaster'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        <App />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
