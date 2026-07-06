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

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/codigos-producto/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/codigos-producto/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/codigos-producto/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/codigos-producto/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/codigos-producto/${id}`),
}

export default codigoProductoService