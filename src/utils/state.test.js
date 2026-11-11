import test from 'node:test'
import assert from 'node:assert/strict'

import {
  appendItem,
  updateById,
  removeById,
  replaceByRecipeId
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
