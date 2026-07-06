import axiosInstance from './axios'

const getAll = (params = {}) =>
  axiosInstance.get('/productos/', { params })


const desactivarColor = (codigoProductoId, colorId) =>
  axiosInstance.patch(`/productos/${codigoProductoId}/color/${colorId}/desactivar`)

const recuperarColor = (codigoProductoId, colorId) =>
  axiosInstance.patch(`/productos/${codigoProductoId}/color/${colorId}/recuperar`)

const eliminarColorPermanente = (codigoProductoId, colorId) =>
  axiosInstance.delete(`/productos/${codigoProductoId}/color/${colorId}`)

const updateColor = (codigoProductoId, colorId, data) =>
  axiosInstance.put(`/productos/${codigoProductoId}/color/${colorId}`, data)

const getCatalogo = (params = {}) =>
  axiosInstance.get('/productos/catalogo', { params })

export const productoService = {
  getAll,
  getCatalogo,
  desactivarColor,
  recuperarColor,
  eliminarColorPermanente,
  updateColor,

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

  getEditarCompleto: (codigoProductoId) =>
    axiosInstance.get(
      `/productos/${codigoProductoId}/editar-completo`
    ),

  create: (data) =>
    axiosInstance.post('/productos/', data),

  createCompleto: (data) =>
    axiosInstance.post('/productos/crear-completo', data),

  update: (id, data) =>
    axiosInstance.put(`/productos/${id}`, data),

  updateCompleto: (codigoProductoId, data) =>
    axiosInstance.put(
      `/productos/${codigoProductoId}/editar-completo`,
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