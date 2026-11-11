export const createEntityId = (prefix = 'id') => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const appendItem = (items, item) => [...items, item]

export const updateById = (items, id, updater) =>
  items.map(item => (item.id === id ? updater(item) : item))

export const removeById = (items, id) => items.filter(item => item.id !== id)

export const replaceByRecipeId = (items, recipeId, replacements) => [
  ...items.filter(item => item.recipe_id !== recipeId),
  ...replacements
]
