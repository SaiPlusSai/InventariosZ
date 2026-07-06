import axiosInstance from './axios'

const getByProductoId = (productoId) =>
  axiosInstance.get(`/productos-imagenes/producto/${productoId}`)

const subirImagen = (productoId, formData) =>
  axiosInstance.post(`/productos-imagenes/producto/${productoId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

const eliminarImagen = (id) =>
  axiosInstance.delete(`/productos-imagenes/${id}`)

const reemplazarImagen = (id, formData) =>
  axiosInstance.patch(`/productos-imagenes/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

const setPrincipal = (id) =>
  axiosInstance.patch(`/productos-imagenes/${id}/principal`)

const updateOrden = (imagenesData) =>
  axiosInstance.patch('/productos-imagenes/orden', { imagenes: imagenesData })

export const productoImagenService = {
  getByProductoId,
  subirImagen,
  eliminarImagen,
  reemplazarImagen,
  setPrincipal,
  updateOrden,
}

export default productoImagenService
