import axiosInstance from './axios'

const exportarExcel = () => axiosInstance.get('/colores/exportar/excel', { responseType: 'blob' })
const descargarPlantilla = () => axiosInstance.get('/colores/importar/plantilla', { responseType: 'blob' })
const importarPrevia = (formData) => axiosInstance.post('/colores/importar/previa', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
const importarConfirmar = (data) => axiosInstance.post('/colores/importar/confirmar', data)


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
  exportarExcel,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar
}

export default colorService