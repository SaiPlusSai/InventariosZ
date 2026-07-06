import axiosInstance from './axios'

export const tipoCalzadoService = {
  getAll: (params = {}) =>
    axiosInstance.get('/tipos-calzado/', { params }),

  getById: (id) =>
    axiosInstance.get(`/tipos-calzado/${id}`),

  create: (data) =>
    axiosInstance.post('/tipos-calzado/', data),

  update: (id, data) =>
    axiosInstance.put(`/tipos-calzado/${id}`, data),

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/tipos-calzado/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/tipos-calzado/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/tipos-calzado/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/tipos-calzado/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/tipos-calzado/${id}`),
}

export default tipoCalzadoService