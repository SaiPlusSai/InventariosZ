import axiosInstance from './axios'

export const codigoProductoService = {
  getAll: (params = {}) =>
    axiosInstance.get('/codigos-producto/', { params }),

  getById: (id) =>
    axiosInstance.get(`/codigos-producto/${id}`),

  create: (data) =>
    axiosInstance.post('/codigos-producto/', data),

  update: (id, data) =>
    axiosInstance.put(`/codigos-producto/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/codigos-producto/${id}`),
}

export default codigoProductoService