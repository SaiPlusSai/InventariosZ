import axiosInstance from './axios'

export const productoService = {
  // GET /productos - Listar todos los productos
  getAll: (params = {}) =>
    axiosInstance.get('/productos', { params }),

  // GET /productos/{id} - Obtener producto por ID
  getById: (id) =>
    axiosInstance.get(`/productos/${id}`),

  // POST /productos - Crear nuevo producto (variante individual)
  create: (data) =>
    axiosInstance.post('/productos', data),

  // POST /productos/crear-completo - Crear producto completo con variantes e imágenes
  createCompleto: (data) =>
    axiosInstance.post('/productos/crear-completo', data),

  // PUT /productos/{id} - Actualizar producto
  update: (id, data) =>
    axiosInstance.put(`/productos/${id}`, data),

  // DELETE /productos/{id} - Eliminar producto
  delete: (id) =>
    axiosInstance.delete(`/productos/${id}`),

  // Search
  search: (query) =>
    axiosInstance.get('/productos/search', { params: { q: query } }),
}

export default productoService
