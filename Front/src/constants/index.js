/**
 * Mensajes de validación comunes
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'Este campo es obligatorio',
  INVALID_EMAIL: 'El email no es válido',
  INVALID_PHONE: 'El teléfono no es válido',
  MIN_LENGTH: 'El campo debe tener al menos',
  MAX_LENGTH: 'El campo no debe exceder',
  PATTERN_MATCH: 'El formato no es válido',
}

/**
 * Estados de stock
 */
export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
}

/**
 * Estados de productos
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DISCONTINUED: 'discontinued',
}

/**
 * Rutas de la aplicación
 */
export const ROUTES = {
  DASHBOARD: '/',
  PRODUCTOS: '/productos',
  MARCAS: '/marcas',
  MATERIALES: '/materiales',
  COLORES: '/colores',
  TALLAS: '/tallas',
  TIPOS: '/tipos',
  CODIGO_PRODUCTO: '/codigo-producto',
}

/**
 * Tamaños de paginación
 */
export const PAGE_SIZES = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 10
