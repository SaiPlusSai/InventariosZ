import axiosInstance from './axios'

export const colorService = {
  getAll: (params = {}) =>
    axiosInstance.get('/colores/', { params }),

  getById: (id) =>
    axiosInstance.get(`/colores/${id}`),

  create: (data) =>
    axiosInstance.post('/colores/', data),

  update: (id, data) =>
    axiosInstance.put(`/colores/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/colores/${id}`),
}

export default colorService