import axiosInstance from './axios'

const getAll = (params = {}) =>
  axiosInstance.get('/productos/', { params })


const desactivarColor = (grupoId, colorId) =>
  axiosInstance.patch(`/productos/${grupoId}/color/${colorId}/desactivar`)

const recuperarColor = (grupoId, colorId) =>
  axiosInstance.patch(`/productos/${grupoId}/color/${colorId}/recuperar`)

const eliminarColorPermanente = (grupoId, colorId) =>
  axiosInstance.delete(`/productos/${grupoId}/color/${colorId}`)

const updateColor = (grupoId, colorId, data) =>
  axiosInstance.put(`/productos/${grupoId}/color/${colorId}`, data)

const bulkAction = (action, items) =>
  axiosInstance.post('/productos/bulk', { action, items })

const previewHardDelete = (items) =>
  axiosInstance.post('/productos/hard-delete/preview', { items })

const getCatalogo = (params = {}) =>
  axiosInstance.get('/productos/catalogo', { params })

const exportarExcel = (params = {}) =>
  axiosInstance.get('/productos/exportar/excel', { params, responseType: 'blob' })

const exportarPdf = (params = {}) =>
  axiosInstance.get('/productos/exportar/pdf', { params, responseType: 'blob' })

const descargarPlantilla = () =>
  axiosInstance.get('/productos/importar/plantilla', { responseType: 'blob' })

const importarPrevia = (formData) =>
  axiosInstance.post('/productos/importar/previa', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

const importarConfirmar = (data) =>
  axiosInstance.post('/productos/importar/confirmar', data)

export const productoService = {
  getAll,
  getCatalogo,
  exportarExcel,
  exportarPdf,
  descargarPlantilla,
  importarPrevia,
  importarConfirmar,
  desactivarColor,
  recuperarColor,
  eliminarColorPermanente,
  updateColor,
  bulkAction,
  previewHardDelete,

  filter: getAll,

  getByCodigo: (codigo) =>
    getAll({ codigo }),

  getByMarca: (marca) =>
    getAll({ marca }),

  getByColor: (color) =>
    getAll({ color }),

  getByMaterial: (material) =>
    getAll({ material }),

  getByTalla: (talla) =>
    getAll({ talla }),

  getByTipo: (tipo) =>
    getAll({ tipo }),

  getById: (id) =>
    axiosInstance.get(`/productos/${id}`),

  getDetalle: (id) =>
    axiosInstance.get(`/productos/${id}/detalle`),

  getEditarCompleto: (productoId) =>
    axiosInstance.get(
      `/productos/${productoId}/editar-completo`
    ),

  create: (data) =>
    axiosInstance.post('/productos/', data),

  createCompleto: (data) =>
    axiosInstance.post('/productos/crear-completo', data),

  update: (id, data) =>
    axiosInstance.put(`/productos/${id}`, data),

  updateCompleto: (productoId, data) =>
    axiosInstance.put(
      `/productos/${productoId}/editar-completo`,
      data
    ),

  
  getPapelera: (params = {}) =>
    axiosInstance.get('/productos/papelera', { params }),

  desactivar: (id) =>
    axiosInstance.patch('/productos/'+id+'/desactivar'),

  recuperar: (id) =>
    axiosInstance.patch('/productos/'+id+'/recuperar'),

  getDependencias: (id) =>
    axiosInstance.get('/productos/'+id+'/dependencias'),

  delete: (id) =>
    axiosInstance.delete(`/productos/${id}`),

  search: (query) =>
    getAll({ codigo: query }),

  incrementarStock: (id) =>
    axiosInstance.patch(
      `/productos/${id}/incrementar-stock`
    ),

  decrementarStock: (id) =>
    axiosInstance.patch(
      `/productos/${id}/decrementar-stock`
    ),
}

export default productoService