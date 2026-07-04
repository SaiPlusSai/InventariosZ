import axiosInstance from './axios'

export const tipoCalzadoService = {
  getAll: (params = {}) =>
    axiosInstance.get('/tipos-calzado', { params }),

  getById: (id) =>
    axiosInstance.get(`/tipos-calzado/${id}`),

  create: (data) =>
    axiosInstance.post('/tipos-calzado', data),

  update: (id, data) =>
    axiosInstance.put(`/tipos-calzado/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/tipos-calzado/${id}`),
}

export default tipoCalzadoService
