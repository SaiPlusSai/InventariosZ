import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, Button } from '../../components/ui'
import { formatCurrency, getStockLabel } from '../../utils/helpers'
import {
  X,
  Package,
  Tag,
  Hash,
  Box,
  Layers,
  Palette
} from 'lucide-react'

export default function ProductoColorDetalle({
  productoCompleto, // La respuesta de productoService.getDetalle(id)
  targetColorId,    // El ID del color que se debe mostrar
  onClose,
}) {
  const [activeImage, setActiveImage] = useState(0)

  if (!productoCompleto) return null

  // Filtramos la data para que solo represente al color objetivo
  const { codigo, marca, tipo_calzado, material, descripcion, variantes, imagenes } = productoCompleto

  // Filtramos variantes de este color
  const variantesColor = variantes.filter(v => v.color.id === targetColorId)
  
  // Asumimos que todas las variantes filtradas tienen el mismo color
  const colorInfo = variantesColor.length > 0 ? variantesColor[0].color : null

  // Filtramos imágenes de este color (o todas si no están vinculadas a la variante en el backend, 
  // pero según la BD las imagenes pertenecen a Variante/Producto)
  // Como `imagenes` están a nivel del CodigoProducto en la respuesta plana, hay que extraerlas.
  // Wait, el backend get_editar_completo devuelve `imagenes` a nivel de variante? 
  // En reality, `imagenes` in `ProductoCompletoResponse` are a flat list, we might need to filter by color if possible. 
  // Si no tienen color, usamos todas o buscamos las de las variantes del color.
  // Para este mockup, vamos a extraer las imágenes principales de las variantesColor y la general
  const galleryImages = [
    ...imagenes.map(img => img.url),
    ...variantesColor.map(v => v.imagen_principal).filter(Boolean)
  ].filter((v, i, a) => a.indexOf(v) === i) // Unique

  if (galleryImages.length === 0) {
    galleryImages.push('https://via.placeholder.com/600x400?text=Sin+Imagen')
  }

  const stockTotal = variantesColor.reduce((acc, v) => acc + v.stock_actual, 0)

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="w-full max-w-6xl h-full max-h-[90vh] bg-gray-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          initial={{ y: 20, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.98 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b bg-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {descripcion || 'Detalle del Producto'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Visualizando información para el color <span className="font-semibold text-gray-700">{colorInfo?.nombre || 'Desconocido'}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8 flex flex-col lg:flex-row gap-8">
            
            {/* Left Column - Gallery */}
            <div className="lg:w-1/3 flex flex-col gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                <img 
                  src={galleryImages[activeImage]} 
                  alt="Principal" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-gray-300'}`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              
              <Card className="mt-4 bg-white border-0 shadow-sm p-5">
                <h4 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Resumen de Inventario</h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Stock Total del Color:</span>
                  <span className={`text-2xl font-bold ${stockTotal > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {stockTotal} <span className="text-sm font-normal text-gray-500">unidades</span>
                  </span>
                </div>
              </Card>
            </div>

            {/* Right Column - Data */}
            <div className="lg:w-2/3 flex flex-col gap-6">
              
              {/* Properties Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                  <Hash className="text-primary-500 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Código</p>
                    <p className="font-semibold text-gray-800">{codigo}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                  <Tag className="text-primary-500 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Marca</p>
                    <p className="font-semibold text-gray-800">{marca?.nombre}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                  <Box className="text-primary-500 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Tipo de Calzado</p>
                    <p className="font-semibold text-gray-800">{tipo_calzado?.nombre}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                  <Layers className="text-primary-500 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Material</p>
                    <p className="font-semibold text-gray-800">{material?.nombre}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-start gap-3">
                  <Palette className="text-primary-500 w-5 h-5 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Color Activo</p>
                    <p className="font-semibold text-gray-800">{colorInfo?.nombre}</p>
                  </div>
                </div>
              </div>

              {/* Tallas Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
                <div className="px-6 py-4 border-b bg-gray-50/50 flex justify-between items-center">
                  <h3 className="font-bold text-gray-700 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    Desglose por Tallas
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white border-b text-sm text-gray-500">
                        <th className="px-6 py-3 font-semibold w-24">Talla</th>
                        <th className="px-6 py-3 font-semibold w-32">Stock</th>
                        <th className="px-6 py-3 font-semibold">Min / Max</th>
                        <th className="px-6 py-3 font-semibold">Precio Venta</th>
                        <th className="px-6 py-3 font-semibold text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variantesColor.length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            No hay variantes registradas para este color.
                          </td>
                        </tr>
                      )}
                      {variantesColor.map((v) => {
                        const precioActivo = v.precios.find(p => p.estado) || v.precios[0] || {}
                        return (
                          <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded font-semibold text-sm">
                                {v.talla.nombre}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className={`font-bold ${v.stock_actual > 0 ? 'text-gray-800' : 'text-red-500'}`}>
                                  {v.stock_actual}
                                </span>
                                <span className="text-xs text-gray-400">{getStockLabel(v.stock_actual)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {v.stock_minimo} / {v.stock_maximo || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-700 bg-green-50 px-2 py-1 rounded">
                                {formatCurrency(precioActivo.precio_venta || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {v.estado ? (
                                <span className="w-3 h-3 rounded-full bg-green-500 inline-block shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
                              ) : (
                                <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
          
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
