import test from 'node:test'
import assert from 'node:assert/strict'

import {
  appendItem,
  updateById,
  removeById,
  replaceByRecipeId,
  duplicateRecipeWithIngredients
} from './state.js'

test('appendItem preserves existing items', () => {
  assert.deepEqual(appendItem([{ id: 1 }], { id: 2 }), [{ id: 1 }, { id: 2 }])
})

test('updateById only updates the matching record', () => {
  const items = [{ id: 'a', nombre: 'Torta' }, { id: 'b', nombre: 'Pan' }]
  const result = updateById(items, 'a', item => ({ ...item, nombre: 'Torta de chocolate' }))

  assert.deepEqual(result, [{ id: 'a', nombre: 'Torta de chocolate' }, { id: 'b', nombre: 'Pan' }])
})

test('removeById does not delete unrelated recipes', () => {
  const items = [{ id: 'a', nombre: 'Torta de chocolate' }, { id: 'b', nombre: 'Brownie' }]
  const result = removeById(items, 'a')

  assert.deepEqual(result, [{ id: 'b', nombre: 'Brownie' }])
})

test('replaceByRecipeId keeps only the latest recipe ingredients', () => {
  const items = [
    { id: 'm1', recipe_id: 'r1', nombre: 'Harina' },
    { id: 'm2', recipe_id: 'r2', nombre: 'Leche' }
  ]

  const result = replaceByRecipeId(items, 'r1', [{ id: 'm3', recipe_id: 'r1', nombre: 'Chocolate' }])

  assert.deepEqual(result, [
    { id: 'm2', recipe_id: 'r2', nombre: 'Leche' },
    { id: 'm3', recipe_id: 'r1', nombre: 'Chocolate' }
  ])
})

test('duplicateRecipeWithIngredients creates a new recipe and ingredient ids without mutating the original', () => {
  const originalRecipe = { id: 'recipe-1', nombre: 'Torta de chocolate', descripcion: 'Base' }
  const originalIngredients = [
    { id: 'ing-1', recipe_id: 'recipe-1', nombre: 'Harina', cantidad: 1 },
    { id: 'ing-2', recipe_id: 'recipe-1', nombre: 'Chocolate', cantidad: 2 }
  ]

  const duplicated = duplicateRecipeWithIngredients(originalRecipe, originalIngredients)

  assert.notEqual(duplicated.recipe.id, originalRecipe.id)
  assert.equal(duplicated.recipe.nombre, 'Torta de chocolate (copia)')
  assert.equal(duplicated.recipe.descripcion, 'Base')
  assert.equal(duplicated.ingredients.length, 2)
  assert.notEqual(duplicated.ingredients[0].id, originalIngredients[0].id)
  assert.notEqual(duplicated.ingredients[1].id, originalIngredients[1].id)
  assert.equal(duplicated.ingredients[0].recipe_id, duplicated.recipe.id)
  assert.equal(duplicated.ingredients[1].recipe_id, duplicated.recipe.id)
  assert.equal(originalRecipe.nombre, 'Torta de chocolate')
  assert.deepEqual(originalIngredients.map(item => item.recipe_id), ['recipe-1', 'recipe-1'])
})
