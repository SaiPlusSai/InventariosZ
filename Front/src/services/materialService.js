import axiosInstance from './axios'

const exportarExcel = () => axiosInstance.get('/materiales/exportar/excel', { responseType: 'blob' })
const descargarPlantilla = () => axiosInstance.get('/materiales/importar/plantilla', { responseType: 'blob' })
const importarPrevia = (formData) => axiosInstance.post('/materiales/importar/previa', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
const importarConfirmar = (data) => axiosInstance.post('/materiales/importar/confirmar', data)


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
  exportarExcel,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar
}

export default materialService