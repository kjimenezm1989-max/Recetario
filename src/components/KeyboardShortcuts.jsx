import React from 'react'
import { useAppContext } from '../context/AppContext'
import './KeyboardShortcuts.css'

export function KeyboardShortcuts({ isOpen, onClose }) {
  const { translate } = useAppContext()

  if (!isOpen) return null

  const shortcutCategories = [
    {
      category: '🔀 Navegación de Páginas',
      shortcuts: [
        { key: 'Alt+1', description: 'Ir a la página de Inicio' },
        { key: 'Alt+2', description: 'Ir a la página de Materiales' },
        { key: 'Alt+3', description: 'Ir a la página de Recetas' },
        { key: 'Alt+4', description: 'Ir a la página de Cotizaciones' },
        { key: 'Alt+5', description: 'Ir a Configuración' }
      ]
    },
    {
      category: '➕ Agregar Nuevos Elementos',
      shortcuts: [
        { key: 'Alt+M', description: 'Agregar nuevo Material (en la página Materiales)' },
        { key: 'Alt+R', description: 'Agregar nueva Receta (en la página Recetas)' },
        { key: 'Alt+Q', description: 'Agregar nueva Cotización (en la página Cotizaciones)' }
      ]
    },
    {
      category: '❓ Ayuda',
      shortcuts: [
        { key: 'Alt+H', description: 'Mostrar esta ventana de ayuda' },
        { key: 'Esc', description: 'Cerrar esta ventana de ayuda' }
      ]
    }
  ]

  return (
    <div className="keyboard-shortcuts-overlay">
      <div className="keyboard-shortcuts-modal">
        <div className="shortcuts-header">
          <h2>⌨️ Instrucciones de Atajos de Teclado</h2>
          <button 
            className="btn-close" 
            onClick={onClose}
            title="Cerrar"
          >
            ✕
          </button>
        </div>
        
        <div className="shortcuts-content">
          <p className="shortcuts-intro">
            A continuación se muestran todos los atajos de teclado disponibles para navegar más rápidamente en la aplicación:
          </p>
          
          {shortcutCategories.map((category, catIndex) => (
            <div key={catIndex} className="shortcuts-category">
              <h3 className="category-title">{category.category}</h3>
              <div className="shortcuts-list">
                {category.shortcuts.map((shortcut, index) => (
                  <div key={index} className="shortcut-item">
                    <kbd className="shortcut-key">{shortcut.key}</kbd>
                    <span className="shortcut-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="shortcuts-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cerrar (Esc)
          </button>
        </div>
      </div>
    </div>
  )
}
