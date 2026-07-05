import axiosInstance from './axios'

const getAll = (params = {}) =>
  axiosInstance.get('/productos/', { params })

export const productoService = {
  getAll,

  filter: getAll,

  getByCodigo: (codigo) =>
    getAll({ codigo }),

  getByMarca: (marca) =>
    getAll({ marca }),

  getByColor: (color) =>
    getAll({ color }),

  getByMaterial: (material) =>
    getAll({ material }),

  getByTalla: (talla) =>
    getAll({ talla }),

  getByTipo: (tipo) =>
    getAll({ tipo }),

  getById: (id) =>
    axiosInstance.get(`/productos/${id}`),
  getDetalle: (id) =>
  axiosInstance.get(`/productos/${id}/detalle`),

  create: (data) =>
    axiosInstance.post('/productos/', data),

  createCompleto: (data) =>
    axiosInstance.post('/productos/crear-completo', data),

  update: (id, data) =>
    axiosInstance.put(`/productos/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/productos/${id}`),

  search: (query) =>
    getAll({ codigo: query }),
  incrementarStock: (id) =>
  axiosInstance.patch(`/productos/${id}/incrementar-stock`),

decrementarStock: (id) =>
  axiosInstance.patch(`/productos/${id}/decrementar-stock`),
}

export default productoService
