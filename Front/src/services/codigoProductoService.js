import axiosInstance from './axios'

export const codigoProductoService = {
  getAll: (params = {}) =>
    axiosInstance.get('/codigo-producto', { params }),

  getById: (id) =>
    axiosInstance.get(`/codigo-producto/${id}`),

  create: (data) =>
    axiosInstance.post('/codigo-producto', data),

  update: (id, data) =>
    axiosInstance.put(`/codigo-producto/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/codigo-producto/${id}`),
}

export default codigoProductoService
