import axiosInstance from './axios'

export const materialService = {
  getAll: (params = {}) =>
    axiosInstance.get('/materiales', { params }),

  getById: (id) =>
    axiosInstance.get(`/materiales/${id}`),

  create: (data) =>
    axiosInstance.post('/materiales', data),

  update: (id, data) =>
    axiosInstance.put(`/materiales/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/materiales/${id}`),
}

export default materialService
