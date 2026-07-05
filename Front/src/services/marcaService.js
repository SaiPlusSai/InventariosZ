import axiosInstance from './axios'

export const marcaService = {
  getAll: (params = {}) =>
    axiosInstance.get('/marcas/', { params }),

  getById: (id) =>
    axiosInstance.get(`/marcas/${id}`),

  create: (data) =>
    axiosInstance.post('/marcas/', data),

  update: (id, data) =>
    axiosInstance.put(`/marcas/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/marcas/${id}`),
}

export default marcaService