import axiosInstance from './axios'

export const tallaService = {
  getAll: (params = {}) =>
    axiosInstance.get('/tallas/', { params }),

  getById: (id) =>
    axiosInstance.get(`/tallas/${id}`),

  create: (data) =>
    axiosInstance.post('/tallas/', data),

  update: (id, data) =>
    axiosInstance.put(`/tallas/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/tallas/${id}`),
}

export default tallaService