import React from 'react'
import { useAppContext } from '../context/AppContext'
import './Navigation.css'

export function Navigation({ activeSection, setActiveSection }) {
  const { translate } = useAppContext()

  const sections = [
    { id: 'home', label: translate('home'), shortcut: 'Alt+1' },
    { id: 'materials', label: translate('materials'), shortcut: 'Alt+2' },
    { id: 'recipes', label: translate('recipes'), shortcut: 'Alt+3' },
    { id: 'quotes', label: translate('quotes'), shortcut: 'Alt+4' },
    { id: 'settings', label: translate('settings'), shortcut: 'Alt+5' }
  ]

  return (
    <nav className="navigation">
      <ul className="nav-list">
        {sections.map(section => (
          <li key={section.id} className="nav-item">
            <button
              className={`nav-link ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
              title={`${section.label} (${section.shortcut})`}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
