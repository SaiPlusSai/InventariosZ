import axiosInstance from './axios'

const exportarExcel = () => axiosInstance.get('/tallas/exportar/excel', { responseType: 'blob' })
const descargarPlantilla = () => axiosInstance.get('/tallas/importar/plantilla', { responseType: 'blob' })
const importarPrevia = (formData) => axiosInstance.post('/tallas/importar/previa', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
const importarConfirmar = (data) => axiosInstance.post('/tallas/importar/confirmar', data)


export const tallaService = {
  getAll: (params = {}) =>
    axiosInstance.get('/tallas/', { params }),

  getById: (id) =>
    axiosInstance.get(`/tallas/${id}`),

  create: (data) =>
    axiosInstance.post('/tallas/', data),

  update: (id, data) =>
    axiosInstance.put(`/tallas/${id}`, data),

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/tallas/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/tallas/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/tallas/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/tallas/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/tallas/${id}`),
  exportarExcel,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar
}

export default tallaService