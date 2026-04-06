import React, { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { Navigation } from './components/Navigation'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { Home } from './pages/Home'
import { Materials } from './pages/Materials'
import { Recipes } from './pages/Recipes'
import { Quotes } from './pages/Quotes'
import { Settings } from './pages/Settings'
import './App.css'

function AppContent() {
  const [activeSection, setActiveSection] = useState('home')
  const [showShortcuts, setShowShortcuts] = useState(false)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Alt + 1 = Home
      if (e.altKey && e.key === '1') {
        e.preventDefault()
        setActiveSection('home')
      }
      // Alt + 2 = Materials
      if (e.altKey && e.key === '2') {
        e.preventDefault()
        setActiveSection('materials')
      }
      // Alt + 3 = Recipes
      if (e.altKey && e.key === '3') {
        e.preventDefault()
        setActiveSection('recipes')
      }
      // Alt + 4 = Quotes
      if (e.altKey && e.key === '4') {
        e.preventDefault()
        setActiveSection('quotes')
      }
      // Alt + 5 = Settings
      if (e.altKey && e.key === '5') {
        e.preventDefault()
        setActiveSection('settings')
      }
      // Alt + H = Show keyboard shortcuts
      if (e.altKey && e.key === 'h') {
        e.preventDefault()
        setShowShortcuts(!showShortcuts)
      }
      // Esc = Close keyboard shortcuts
      if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showShortcuts])

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <Home setActiveSection={setActiveSection} />
      case 'materials':
        return <Materials />
      case 'recipes':
        return <Recipes />
      case 'quotes':
        return <Quotes />
      case 'settings':
        return <Settings />
      default:
        return <Home setActiveSection={setActiveSection} />
    }
  }

  return (
    <div className="app">
      <Header />
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="app-main">
        {renderSection()}
      </main>
      <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
