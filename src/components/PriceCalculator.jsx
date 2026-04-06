import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { formatCurrency } from '../utils/currency'
import { calculateFinalPrice, calculateRecipeCost } from '../utils/calculations'
import './PriceCalculator.css'

export function PriceCalculator({ selectedRecipeId, onPriceCalculated }) {
  const { translate, config, recipes, materials, configCosts, getRecipeMaterialsByRecipeId } = useAppContext()

  const [profitMargin, setProfitMargin] = useState(configCosts.ganancia || 20)
  const [expenses, setExpenses] = useState(configCosts.gastos || 5)
  const [packaging, setPackaging] = useState(configCosts.empaque || 3)
  const [calculation, setCalculation] = useState(null)

  const selectedRecipe = recipes.find(r => r.id === selectedRecipeId)

  const handleCalculate = () => {
    if (!selectedRecipe) {
      alert('Por favor selecciona una receta')
      return
    }

    const recipeItems = getRecipeMaterialsByRecipeId(selectedRecipeId)
    const baseCost = calculateRecipeCost(recipeItems, materials)
    const result = calculateFinalPrice(baseCost, profitMargin, expenses, packaging)

    setCalculation(result)
    onPriceCalculated?.(result)
  }

  return (
    <div className="price-calculator">
      <h3>{translate('calculate')} {translate('finalPrice')}</h3>

      {selectedRecipe && (
        <div className="recipe-selection">
          <p className="selected-recipe">
            <strong>{translate('recipes')}:</strong> {selectedRecipe.nombre}
          </p>
        </div>
      )}

      <div className="calculator-inputs">
        <div className="input-group">
          <label htmlFor="profitMargin">
            <span>{translate('profitMargin')}</span>
            <span className="value-display">{profitMargin}%</span>
          </label>
          <input
            type="range"
            id="profitMargin"
            min="0"
            max="200"
            value={profitMargin}
            onChange={(e) => setProfitMargin(parseFloat(e.target.value))}
            className="slider"
          />
          <input
            type="number"
            value={profitMargin}
            onChange={(e) => setProfitMargin(parseFloat(e.target.value))}
            step="0.5"
            min="0"
            max="200"
            className="number-input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="expenses">
            <span>{translate('expenses')}</span>
            <span className="value-display">{expenses}%</span>
          </label>
          <input
            type="range"
            id="expenses"
            min="0"
            max="100"
            value={expenses}
            onChange={(e) => setExpenses(parseFloat(e.target.value))}
            className="slider"
          />
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(parseFloat(e.target.value))}
            step="0.5"
            min="0"
            max="100"
            className="number-input"
          />
        </div>

        <div className="input-group">
          <label htmlFor="packaging">
            <span>{translate('packaging')}</span>
            <span className="value-display">{packaging}%</span>
          </label>
          <input
            type="range"
            id="packaging"
            min="0"
            max="100"
            value={packaging}
            onChange={(e) => setPackaging(parseFloat(e.target.value))}
            className="slider"
          />
          <input
            type="number"
            value={packaging}
            onChange={(e) => setPackaging(parseFloat(e.target.value))}
            step="0.5"
            min="0"
            max="100"
            className="number-input"
          />
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleCalculate}>
        {translate('calculate')}
      </button>

      {calculation && (
        <div className="calculation-results">
          <div className="result-item">
            <span className="result-label">{translate('basePrice')}:</span>
            <span className="result-value">
              {formatCurrency(calculation.basePrice, config.moneda)}
            </span>
          </div>

          <div className="result-item">
            <span className="result-label">
              {translate('expenses')} + {translate('packaging')}:
            </span>
            <span className="result-value">
              {formatCurrency(calculation.totalExpenses, config.moneda)}
            </span>
          </div>

          <div className="result-item final-price">
            <span className="result-label">{translate('finalPrice')}:</span>
            <span className="result-value">
              {formatCurrency(calculation.finalPrice, config.moneda)}
            </span>
          </div>

          <div className="result-summary">
            <p>
              Ganancia estimada: <strong>{formatCurrency(calculation.profitAmount, config.moneda)}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
