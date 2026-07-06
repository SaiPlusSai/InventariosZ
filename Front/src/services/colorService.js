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

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/colores/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/colores/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/colores/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/colores/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/colores/${id}`),
}

export default colorService