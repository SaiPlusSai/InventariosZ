/**
 * Valida si un email es válido
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Formatea un número como moneda
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(value)
}

/**
 * Obtiene el estado del stock como color
 */
export const getStockStatus = (stock) => {
  if (stock > 5) return 'green'
  if (stock > 0) return 'yellow'
  return 'red'
}

/**
 * Obtiene el label del estado del stock
 */
export const getStockLabel = (stock) => {
  if (stock > 5) return '🟢 En stock'
  if (stock > 0) return '🟡 Poco stock'
  return '🔴 Sin stock'
}

/**
 * Formateja un arreglo de objetos a string legible
 */
export const formatArrayToString = (arr, key) => {
  if (!Array.isArray(arr)) return ''
  return arr.map((item) => item[key] || item).join(', ')
}

/**
 * Pagina un arreglo
 */
export const paginate = (array, page, pageSize) => {
  const start = (page - 1) * pageSize
  return array.slice(start, start + pageSize)
}

/**
 * Agrupa un arreglo por una propiedad
 */
export const groupBy = (array, key) => {
  return array.reduce((acc, curr) => {
    const group = curr[key]
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(curr)
    return acc
  }, {})
}
