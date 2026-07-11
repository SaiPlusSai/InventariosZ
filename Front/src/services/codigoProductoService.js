import axiosInstance from './axios'

const exportarExcel = () => axiosInstance.get('/codigos-producto/exportar/excel', { responseType: 'blob' })
const descargarPlantilla = () => axiosInstance.get('/codigos-producto/importar/plantilla', { responseType: 'blob' })
const importarPrevia = (formData) => axiosInstance.post('/codigos-producto/importar/previa', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
const importarConfirmar = (data) => axiosInstance.post('/codigos-producto/importar/confirmar', data)

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

  exportarExcel,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar
}

export default codigoProductoService