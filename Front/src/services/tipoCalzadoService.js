import axiosInstance from './axios'

const exportarExcel = () => axiosInstance.get('/tipos/exportar/excel', { responseType: 'blob' })
const descargarPlantilla = () => axiosInstance.get('/tipos/importar/plantilla', { responseType: 'blob' })
const importarPrevia = (formData) => axiosInstance.post('/tipos/importar/previa', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
const importarConfirmar = (data) => axiosInstance.post('/tipos/importar/confirmar', data)


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
  exportarExcel,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar
}

export default tipoCalzadoService