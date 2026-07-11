import axiosInstance from './axios'

const exportarExcel = () => axiosInstance.get('/marcas/exportar/excel', { responseType: 'blob' })
const descargarPlantilla = () => axiosInstance.get('/marcas/importar/plantilla', { responseType: 'blob' })
const importarPrevia = (formData) => axiosInstance.post('/marcas/importar/previa', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
const importarConfirmar = (data) => axiosInstance.post('/marcas/importar/confirmar', data)

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
    
  exportarExcel,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar
}

export default marcaService