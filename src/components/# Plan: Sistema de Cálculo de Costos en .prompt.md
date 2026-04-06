# Plan: Sistema de Cálculo de Costos en Recetas - Recetario

## Problema Identificado
El costo de los ingredientes en la sección de recetas **no se está mostrando** en la interfaz, aunque el código está calculando el valor.

## Raíz del Problema (Hipótesis)
1. El costo se calcula en `handleAddIngredient()` y se guarda en `ingredient.costo_ingrediente`
2. La función de visualización en el mapeo de ingredientes obtiene el valor
3. **PERO** el `config.moneda` o `formatCurrency()` puede estar retornando un valor vacío o inválido

## Análisis del Flujo Actual

### 1. Creación de Ingrediente (`handleAddIngredient`)
```javascript
const ingredientCost = calculateIngredientCost(
  material.precio,        // ej: 26000
  material.presentacion,  // ej: "1L"
  cantidadValor,         // ej: 300
  newIngredient.unidad_medida  // ej: "ml"
)
// Resultado esperado: 7800

const newRecipeIngredient = {
  id: "timestamp",
  material_id: "id",
  cantidad: quantityFraction,
  cantidad_valor: cantidadValor,
  unidad_medida: newIngredient.unidad_medida,
  costo_ingrediente: ingredientCost  // ← SE GUARDA AQUÍ
}
```

### 2. Visualización de Ingredientes (en JSX)
```javascript
const totalIngredientCost = ingredient.costo_ingrediente !== undefined 
  ? ingredient.costo_ingrediente
  : ingredient.cantidad * (material ? material.precio / material.cantidad_presentacion : 0)

// Luego se renderiza:
{totalIngredientCost > 0 ? formatCurrency(totalIngredientCost, config.moneda) : '-'}
```

## Posibles Causas

### A. `config.moneda` No Está Disponible
- `config` viene del contexto y puede ser `undefined`
- Solución: Validar que `config` y `config.moneda` existan

### B. `formatCurrency()` Retorna Vacío
- La función puede no estar manejando valores correctamente
- Solución: Revisar `/src/utils/currency.js`

### C. `totalIngredientCost` Es 0 o Undefined
- El cálculo de `calculateIngredientCost()` puede estar fallando silenciosamente
- Solución: Añadir logs en `calculateIngredientCost()` (ya hecho)

### D. El Ingrediente No Se Está Agregando Correctamente
- `handleAddIngredient()` puede no estar llamándose
- `setIngredients()` puede no estarse actualizando correctamente
- Solución: Verificar que `ingredients` se actualiza después de agregar

### E. Re-render No Ocurre
- El componente puede no re-renderizar cuando `ingredients` cambia
- Solución: Revisar dependencias de `useEffect`

## Plan de Solución en Pasos

### Paso 1: Verificar `formatCurrency()`
**Archivo**: `src/utils/currency.js`
- [ ] Revisar que la función existe y retorna un string
- [ ] Verificar que maneja el parámetro `moneda` correctamente
- [ ] Hacer logs si devuelve un valor anómalo

### Paso 2: Añadir Validaciones Defensivas
**Archivo**: `src/components/RecipeForm.jsx`
- [ ] Validar que `config` existe antes de usarlo
- [ ] Fallback a 'USD' si `config.moneda` no existe
- [ ] Añadir console.log para ver qué se está pasando a `formatCurrency()`

### Paso 3: Verificar Flujo de Agregación
**Archivo**: `src/components/RecipeForm.jsx`
- [ ] Añadir log en `handleAddIngredient()` para confirmar que se llama
- [ ] Verificar que `ingredient.costo_ingrediente` tiene valor
- [ ] Confirmar que `setIngredients()` actualiza el estado

### Paso 4: Revisar Visualización
**Archivo**: `src/components/RecipeForm.jsx`
- [ ] Verificar que el mapeo de `ingredients` se ejecuta
- [ ] Confirmar que `totalIngredientCost` tiene valor
- [ ] Asegurar que `formatCurrency()` recibe ambos parámetros

### Paso 5: Debug en Console
**Durante desarrollo**:
- [ ] Abrir DevTools (F12)
- [ ] Ir a la pestaña de Recetas
- [ ] Crear una receta test
- [ ] Agregar un material con cantidad conocida
- [ ] Revisar console.log para ver dónde falla

### Paso 6: Costo Total de Receta
**Archivo**: `src/components/RecipeForm.jsx`
- [ ] Verificar que `totalCost` (state) se calcula correctamente
- [ ] Revisar `calculateRecipeCost()` en `calculations.js`
- [ ] Asegurar que usa `costo_ingrediente` si existe

## Cambios Necesarios

### cambio 1: Mejorar RecipeForm.jsx - Visualización de Costo
```javascript
// ANTES:
{totalIngredientCost > 0 ? formatCurrency(totalIngredientCost, config.moneda) : '-'}

// DESPUÉS:
{totalIngredientCost > 0 
  ? formatCurrency(totalIngredientCost, config?.moneda || 'USD') 
  : 'No calculado'}
```

### Cambio 2: Añadir Logs en handleAddIngredient()
```javascript
console.log('🔍 Agregando ingrediente:', {
  material_id: newIngredient.material_id,
  cantidad_valor: cantidadValor,
  unidad_medida: newIngredient.unidad_medida,
  ingredientCost, // ← AQUÍ DEBE HABER UN NÚMERO
  material: material?.nombre
})
```

### Cambio 3: Revisar Visualización Total
```javascript
// Confirmar que totalCost se actualiza:
useEffect(() => {
  console.log('📊 Recalculando costo total:', { 
    ingredients: ingredients.length, 
    totalCost 
  })
  const cost = calculateRecipeCost(ingredients, materials)
  setTotalCost(cost)
}, [ingredients, materials])
```

## Testing
1. Crear material: "Leche" con presentación "1L" y precio "26000"
2. Crear receta: "Batido"
3. Agregar ingrediente: Leche, 300, ml
4. **Verificar en console**:
   - ¿Se ejecuta handleAddIngredient()?
   - ¿`ingredientCost` es 7800?
   - ¿Se actualiza el state `ingredients`?
   - ¿Se renderiza correctamente?
5. **Verificar en UI**:
   - ¿Aparece "300 ml" en la lista?
   - ¿Aparece el costo (debería ser ~7800)?
   - ¿Aparece el costo total de receta?

## Archivos a Revisar
- `src/components/RecipeForm.jsx` - Lógica de visualización
- `src/utils/currency.js` - Función formatCurrency()
- `src/utils/unitConversion.js` - Función calculateIngredientCost()
- `src/utils/calculations.js` - Función calculateRecipeCost()
- `src/context/AppContext.jsx` - Config y estado

## Notas Importantes
- Los logs en `unitConversion.js` ya están añadidos, revisar console del navegador
- El estado debe reactivarse después de cada cambio (hot reload activo)
- Usar DevTools para inspeccionar el estado de `ingredients`
