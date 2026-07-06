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

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/marcas/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/marcas/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/marcas/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/marcas/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/marcas/${id}`),
}

export default marcaService