import { useEffect, useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useColorStore } from '../../../store/colorStore'
import { useTallaStore } from '../../../store/tallaStore'
import { colorService } from '../../../services/colorService'
import { tallaService } from '../../../services/tallaService'
import { productoImagenService } from '../../../services/productoImagenService'
import { Input, Button } from '../../../components/ui'

export default function Step2ConfiguracionVariantes() {
  const { formData, setFormData } = useWizardStore()
  const { colores: dbColores, setColores: setDbColores } = useColorStore()
  const { tallas: dbTallas, setTallas: setDbTallas } = useTallaStore()
  const [loading, setLoading] = useState(true)

  // Masive apply states (by color)
  const [masivo, setMasivo] = useState({})

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coloresRes, tallasRes] = await Promise.all([
          colorService.getAll(),
          tallaService.getAll(),
        ])
        setDbColores(coloresRes.data)
        setDbTallas(tallasRes.data)
      } catch (error) {
        console.error('Error cargando catalogos:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [setDbColores, setDbTallas])

  // Handle color selection
  const toggleColor = (colorId) => {
    const selected = formData.colores.includes(colorId)
    const newColores = selected
      ? formData.colores.filter((id) => id !== colorId)
      : [...formData.colores, colorId]

    // Initialize images array for new color if not exists
    const newImagenesPorColor = { ...formData.imagenesPorColor }
    if (!selected && !newImagenesPorColor[colorId]) {
      newImagenesPorColor[colorId] = []
    }

    setFormData({ colores: newColores, imagenesPorColor: newImagenesPorColor })
    syncVariantes(newColores, formData.tallas)
  }

  // Handle talla selection
  const toggleTalla = (tallaId) => {
    const selected = formData.tallas.includes(tallaId)
    const newTallas = selected
      ? formData.tallas.filter((id) => id !== tallaId)
      : [...formData.tallas, tallaId]

    setFormData({ tallas: newTallas })
    syncVariantes(formData.colores, newTallas)
  }

  // Generate or remove variants based on matrix (Colors x Tallas)
  const syncVariantes = (currentColores, currentTallas) => {
    const nuevasVariantes = []
    
    currentColores.forEach((cId) => {
      currentTallas.forEach((tId) => {
        // Buscamos si ya existe para mantener sus datos
        const existente = formData.variantes.find(
          (v) => v.color_id === cId && v.talla_id === tId
        )
        
        if (existente) {
          nuevasVariantes.push(existente)
        } else {
          nuevasVariantes.push({
            color_id: cId,
            talla_id: tId,
            stock_actual: 0,
            stock_minimo: 0,
            stock_maximo: null,
            precio_compra: null,
            precio_venta: 0,
            estado: true,
          })
        }
      })
    })

    setFormData({ variantes: nuevasVariantes })
  }

  // Update a specific variant field
  const updateVariante = (colorId, tallaId, field, value) => {
    const newVariantes = formData.variantes.map((v) => {
      if (v.color_id === colorId && v.talla_id === tallaId) {
        return { ...v, [field]: value }
      }
      return v
    })
    setFormData({ variantes: newVariantes })
  }

  // Apply massive values to all variants of a color
  const aplicarMasivo = (colorId) => {
    const masivoColor = masivo[colorId]
    if (!masivoColor) return

    const newVariantes = formData.variantes.map((v) => {
      if (v.color_id === colorId) {
        return {
          ...v,
          stock_actual: masivoColor.stock_actual ?? v.stock_actual,
          stock_minimo: masivoColor.stock_minimo ?? v.stock_minimo,
          precio_compra: masivoColor.precio_compra ?? v.precio_compra,
          precio_venta: masivoColor.precio_venta ?? v.precio_venta,
        }
      }
      return v
    })
    setFormData({ variantes: newVariantes })
  }

  const handleMasivoChange = (colorId, field, value) => {
    setMasivo({
      ...masivo,
      [colorId]: {
        ...(masivo[colorId] || {}),
        [field]: value
      }
    })
  }

  // Handle image upload for a specific color
  const handleAddImagenColor = (colorId, e) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const currentImages = formData.imagenesPorColor[colorId] || []
          const nuevoOrden = currentImages.filter(i => !i.es_principal).length + 1
          
          const nuevaImagen = {
            bucket: 'local',
            ruta: `imagenes/${Date.now()}-${file.name}`,
            nombre_archivo: file.name,
            es_principal: currentImages.length === 0,
            orden: currentImages.length === 0 ? 1 : nuevoOrden,
            datos_base64: event.target.result,
            file: file,
          }
          
          setFormData({
            imagenesPorColor: {
              ...formData.imagenesPorColor,
              [colorId]: [...currentImages, nuevaImagen]
            }
          })
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImagenColor = async (colorId, index) => {
    const currentImages = formData.imagenesPorColor[colorId] || []
    const imgToRemove = currentImages[index]
    
    // Si la imagen viene de la base de datos (tiene id), la eliminamos de Supabase
    if (imgToRemove && imgToRemove.id) {
      try {
        await productoImagenService.eliminarImagen(imgToRemove.id)
      } catch (error) {
        console.error("Error al eliminar imagen de la base de datos:", error)
        // Puedes agregar una alerta o notificacion aqui
      }
    }

    const nuevasImagenes = currentImages.filter((_, i) => i !== index)
    
    if (nuevasImagenes.length > 0) {
      nuevasImagenes[0].es_principal = true
      nuevasImagenes[0].orden = 1
      nuevasImagenes.forEach((img, idx) => {
        if (idx > 0) {
          img.es_principal = false
          img.orden = idx + 1
        }
      })
    }
    
    setFormData({
      imagenesPorColor: {
        ...formData.imagenesPorColor,
        [colorId]: nuevasImagenes
      }
    })
  }

  if (loading) return <div>Cargando configuración...</div>

  return (
    <div className="space-y-8">
      
      {/* 1. SELECCION GLOBAL */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">1. Seleccionar Colores Disponibles</h3>
          <div className="flex flex-wrap gap-3">
            {dbColores.map((c) => (
              <label key={c.id} className={`flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition-colors ${formData.colores.includes(c.id) ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.colores.includes(c.id)}
                  onChange={() => toggleColor(c.id)}
                />
                {c.nombre}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">2. Seleccionar Tallas Disponibles</h3>
          <div className="flex flex-wrap gap-3">
            {dbTallas.map((t) => (
              <label key={t.id} className={`flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${formData.tallas.includes(t.id) ? 'bg-primary-50 border-primary-500 text-primary-700 font-medium' : 'hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={formData.tallas.includes(t.id)}
                  onChange={() => toggleTalla(t.id)}
                />
                {t.nombre}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BLOQUES POR COLOR */}
      {formData.colores.length > 0 && formData.tallas.length > 0 && (
        <div className="space-y-8">
          <h3 className="text-xl font-bold">3. Configurar Variantes e Imágenes</h3>
          
          {formData.colores.map((colorId) => {
            const colorObj = dbColores.find(c => c.id === colorId)
            const variantesColor = formData.variantes.filter(v => v.color_id === colorId)
            const imagenesColor = formData.imagenesPorColor[colorId] || []
            
            return (
              <div key={colorId} className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-xl font-bold text-gray-800 mb-6 uppercase tracking-wider border-b pb-2">{colorObj?.nombre}</h4>
                
                {/* UPLOADER DE IMAGENES PARA ESTE COLOR */}
                <div className="mb-8">
                  <h5 className="font-semibold mb-3 text-sm text-gray-600">Imágenes del Color {colorObj?.nombre}</h5>
                  <div className="flex items-center gap-4 mb-4 overflow-x-auto pb-2">
                    {imagenesColor.map((img, idx) => (
                      <div key={idx} className="relative flex-shrink-0 group">
                        <img
                          src={img.datos_base64}
                          alt="preview"
                          className={`w-24 h-24 object-cover rounded-lg border-2 ${img.es_principal ? 'border-primary-500' : 'border-gray-300'}`}
                        />
                        {img.es_principal && (
                          <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full">Princ</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImagenColor(colorId, idx)}
                          className="absolute -top-2 -left-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0 bg-white">
                      <span className="text-2xl text-gray-400">+</span>
                      <span className="text-xs text-gray-500 mt-1 font-medium">Añadir</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleAddImagenColor(colorId, e)}
                      />
                    </label>
                  </div>
                </div>

                {/* APLICACION MASIVA */}
                <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6 shadow-sm">
                  <h5 className="font-semibold mb-3 text-sm text-gray-600">Aplicación Masiva (Aplica a todas las tallas de este color)</h5>
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[120px]">
                      <Input
                        label="Precio Compra"
                        type="number"
                        step="0.01"
                        value={masivo[colorId]?.precio_compra || ''}
                        onChange={(e) => handleMasivoChange(colorId, 'precio_compra', e.target.value)}
                        error={masivo[colorId]?.precio_compra !== undefined && masivo[colorId].precio_compra !== '' && Number(masivo[colorId].precio_compra) < 0 ? "Debe ser >= 0" : null}
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Input
                        label="Precio Venta"
                        type="number"
                        step="0.01"
                        value={masivo[colorId]?.precio_venta || ''}
                        onChange={(e) => handleMasivoChange(colorId, 'precio_venta', e.target.value)}
                        error={masivo[colorId]?.precio_venta !== undefined && masivo[colorId].precio_venta !== '' && Number(masivo[colorId].precio_venta) <= 0 ? "Debe ser > 0" : null}
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Input
                        label="Stock Actual"
                        type="number"
                        value={masivo[colorId]?.stock_actual || ''}
                        onChange={(e) => handleMasivoChange(colorId, 'stock_actual', e.target.value)}
                        error={masivo[colorId]?.stock_actual !== undefined && masivo[colorId].stock_actual !== '' && Number(masivo[colorId].stock_actual) < 0 ? "Debe ser >= 0" : null}
                      />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <Input
                        label="Stock Minimo"
                        type="number"
                        value={masivo[colorId]?.stock_minimo || ''}
                        onChange={(e) => handleMasivoChange(colorId, 'stock_minimo', e.target.value)}
                        error={masivo[colorId]?.stock_minimo !== undefined && masivo[colorId].stock_minimo !== '' && Number(masivo[colorId].stock_minimo) < 0 ? "Debe ser >= 0" : null}
                      />
                    </div>
                    <Button variant="secondary" onClick={() => aplicarMasivo(colorId)} className="h-10">
                      Aplicar
                    </Button>
                  </div>
                </div>

                {/* TABLA DE VARIANTES */}
                <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs">Talla</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs w-24">Stock</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs w-24">S. Mín</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs w-32">P. Compra</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs w-32">P. Venta</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 uppercase text-xs w-24 text-center">Activo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {variantesColor.map((v) => {
                        const tallaObj = dbTallas.find(t => t.id === v.talla_id)
                        const errStock = Number(v.stock_actual) < 0;
                        const errMinimo = Number(v.stock_minimo) < 0;
                        const errCompra = v.precio_compra !== null && v.precio_compra !== '' && Number(v.precio_compra) < 0;
                        const errVenta = Number(v.precio_venta) <= 0;

                        return (
                          <tr key={v.talla_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-900">{tallaObj?.nombre}</td>
                            <td className="px-4 py-2 align-top">
                              <input
                                type="number"
                                className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${errStock ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-300'}`}
                                value={v.stock_actual}
                                onChange={(e) => updateVariante(colorId, v.talla_id, 'stock_actual', e.target.value)}
                              />
                              {errStock && <span className="text-xs text-red-500 mt-1 block">Debe ser &gt;= 0</span>}
                            </td>
                            <td className="px-4 py-2 align-top">
                              <input
                                type="number"
                                className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${errMinimo ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-300'}`}
                                value={v.stock_minimo}
                                onChange={(e) => updateVariante(colorId, v.talla_id, 'stock_minimo', e.target.value)}
                              />
                              {errMinimo && <span className="text-xs text-red-500 mt-1 block">Debe ser &gt;= 0</span>}
                            </td>
                            <td className="px-4 py-2 align-top">
                              <input
                                type="number"
                                step="0.01"
                                className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${errCompra ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-300'}`}
                                value={v.precio_compra || ''}
                                onChange={(e) => updateVariante(colorId, v.talla_id, 'precio_compra', e.target.value)}
                              />
                              {errCompra && <span className="text-xs text-red-500 mt-1 block">Debe ser &gt;= 0</span>}
                            </td>
                            <td className="px-4 py-2 align-top">
                              <input
                                type="number"
                                step="0.01"
                                className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${errVenta ? 'border-red-500 bg-red-50 text-red-900' : 'border-gray-300'}`}
                                value={v.precio_venta}
                                onChange={(e) => updateVariante(colorId, v.talla_id, 'precio_venta', e.target.value)}
                              />
                              {errVenta && <span className="text-xs text-red-500 mt-1 block">Debe ser &gt; 0</span>}
                            </td>
                            <td className="px-4 py-2 text-center align-top pt-4">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer" 
                                  checked={v.estado ?? true}
                                  onChange={(e) => updateVariante(colorId, v.talla_id, 'estado', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                              </label>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )
          })}
        </div>
      )}
      
      {formData.colores.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          <p>ℹ️ Selecciona al menos un color de la parte superior para comenzar a configurar variantes.</p>
        </div>
      )}
      {formData.colores.length > 0 && formData.tallas.length === 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
          <p>ℹ️ Selecciona al menos una talla para mostrar la tabla de inventario por color.</p>
        </div>
      )}
    </div>
  )
}
