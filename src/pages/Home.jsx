import React from 'react'
import { useAppContext } from '../context/AppContext'
import './Home.css'

export function Home({ setActiveSection }) {
  const { translate, config, materials, recipes, quotes } = useAppContext()

  const modules = [
    {
      id: 'materials',
      label: translate('materials'),
      icon: '🧂',
      description: 'Gestiona tus materiales y costos',
      count: materials.length
    },
    {
      id: 'recipes',
      label: translate('recipes'),
      icon: '🍰',
      description: 'Crea y organiza tus recetas',
      count: recipes.length
    },
    {
      id: 'quotes',
      label: translate('quotes'),
      icon: '📋',
      description: 'Genera cotizaciones profesionales',
      count: quotes.length
    }
  ]

  return (
    <div className="home-container">
      <div className="home-welcome">
        <h2>
          {translate('welcome')} <span className="welcome-brand">{config.nombre_negocio}</span>
        </h2>
        <p className="welcome-subtitle">{config.descripcion_negocio || translate('welcome_subtitle')}</p>
      </div>

      <div className="modules-grid">
        {modules.map(module => (
          <div
            key={module.id}
            className="module-card"
            onClick={() => setActiveSection(module.id)}
            title={`Presiona Alt+${['materials', 'recipes', 'quotes'].indexOf(module.id) + 2} para ir a esta sección`}
          >
            <div className="module-icon">{module.icon}</div>
            <h3 className="module-title">{module.label}</h3>
            <p className="module-description">{module.description}</p>
            <div className="module-count">
              {module.count} {module.count === 1 ? 'elemento' : 'elementos'}
            </div>
            <button className="module-button">
              {translate('start')}
            </button>
          </div>
        ))}
      </div>

      <div className="home-info">
        <div className="info-card">
          <h3>💡 ¿Cómo funciona?</h3>
          <ol className="info-list">
            <li>Agrega tus materiales con sus costos</li>
            <li>Crea tus recetas seleccionando ingredientes</li>
            <li>Calcula el precio final considerando ganancia</li>
            <li>Genera cotizaciones profesionales</li>
          </ol>
        </div>

        <div className="info-card">
          <h3>⚙️ Configuración</h3>
          <p>Personaliza tu aplicación: idioma, moneda, logo y nombre del negocio.</p>
          <button
            className="btn btn-secondary"
            onClick={() => setActiveSection('settings')}
            title="Presiona Alt+5 para ir a configuración"
          >
            {translate('settings')}
          </button>
        </div>
      </div>
    </div>
  )
}
