import axiosInstance from './axios'

export const materialService = {
  getAll: (params = {}) =>
    axiosInstance.get('/materiales/', { params }),

  getById: (id) =>
    axiosInstance.get(`/materiales/${id}`),

  create: (data) =>
    axiosInstance.post('/materiales/', data),

  update: (id, data) =>
    axiosInstance.put(`/materiales/${id}`, data),

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/materiales/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/materiales/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/materiales/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/materiales/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/materiales/${id}`),
}

export default materialService