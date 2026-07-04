import { useEffect, useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useColorStore } from '../../../store/colorStore'
import { useTallaStore } from '../../../store/tallaStore'
import { Input, Button } from '../../../components/ui'

export default function Step4Variantes() {
  const { formData, setFormData, updateVariante } = useWizardStore()
  const { colores } = useColorStore()
  const { tallas } = useTallaStore()
  const [selectedColor, setSelectedColor] = useState(null)
  const [bulkPrecio, setBulkPrecio] = useState('')
  const [bulkStock, setBulkStock] = useState('')
  const [bulkEstado, setBulkEstado] = useState('activo')

  // Generar variantes automáticamente cuando cambien colores o tallas
  useEffect(() => {
    if (formData.colores.length > 0 && formData.tallas.length > 0) {
      const nuevasVariantes = []

      formData.colores.forEach((colorId) => {
        formData.tallas.forEach((tallaId) => {
          const varianteExistente = formData.variantes.find(
            (v) => v.color_id === colorId && v.talla_id === tallaId
          )

          nuevasVariantes.push(
            varianteExistente || {
              color_id: colorId,
              talla_id: tallaId,
              stock_actual: 0,
              stock_minimo: 0,
              stock_maximo: null,
              precio_compra: 0,
              precio_venta: 0,
              estado: true,
            }
          )
        })
      })

      setFormData({ variantes: nuevasVariantes })
      if (formData.colores.length > 0) {
        setSelectedColor(formData.colores[0])
      }
    }
  }, [formData.colores, formData.tallas])

  const handleVarianteChange = (varianteIndex, field, value) => {
    const realIndex = formData.variantes.findIndex((_, idx) => idx === varianteIndex)
    updateVariante(realIndex, {
      [field]: ['stock_actual', 'stock_minimo', 'precio_compra', 'precio_venta'].includes(field)
        ? parseFloat(value) || 0 
        : field === 'estado'
        ? value === 'true' || value === true
        : value,
    })
  }

  const handleBulkUpdate = () => {
    formData.variantes.forEach((variante, index) => {
      if (
        selectedColor === null ||
        variante.color_id === selectedColor
      ) {
        const updates = {}
        if (bulkPrecio !== '') updates.precio_venta = parseFloat(bulkPrecio)
        if (bulkStock !== '') updates.stock_actual = parseFloat(bulkStock)
        if (bulkEstado !== '') updates.estado = bulkEstado === 'activo'

        if (Object.keys(updates).length > 0) {
          const realIndex = formData.variantes.findIndex((_, idx) => idx === index)
          updateVariante(realIndex, updates)
        }
      }
    })

    // Limpiar inputs
    setBulkPrecio('')
    setBulkStock('')
  }

  const variantesToShow = selectedColor
    ? formData.variantes.filter((v) => v.color_id === selectedColor)
    : formData.variantes

  const colorActual = colores.find((c) => c.id === selectedColor)

  return (
    <div className="space-y-6">
      {/* Filtro por color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por color
        </label>
        <select
          value={selectedColor || ''}
          onChange={(e) => setSelectedColor(parseInt(e.target.value) || null)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos los colores</option>
          {colores
            .filter((c) => formData.colores.includes(c.id))
            .map((color) => (
              <option key={color.id} value={color.id}>
                {color.nombre}
              </option>
            ))}
        </select>
      </div>

      {/* Aplicar valores masivos */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Aplicar valores masivos</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
          <Input
            label="Precio"
            type="number"
            step="0.01"
            value={bulkPrecio}
            onChange={(e) => setBulkPrecio(e.target.value)}
            placeholder="Precio venta"
          />
          <Input
            label="Stock"
            type="number"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            placeholder="Cantidad"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={bulkEstado}
              onChange={(e) => setBulkEstado(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleBulkUpdate} variant="secondary" className="w-full">
              Aplicar
            </Button>
          </div>
        </div>
        <p className="text-xs text-gray-600">
          {selectedColor
            ? `Aplicará a las variantes de ${colorActual?.nombre}`
            : 'Aplicará a todas las variantes'}
        </p>
      </div>

      {/* Matriz de variantes */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-2 text-left font-medium">Talla</th>
              <th className="px-4 py-2 text-left font-medium">Stock Actual</th>
              <th className="px-4 py-2 text-left font-medium">Stock Mín</th>
              <th className="px-4 py-2 text-left font-medium">Precio Venta</th>
              <th className="px-4 py-2 text-left font-medium">Precio Compra</th>
              <th className="px-4 py-2 text-left font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {variantesToShow.map((variante, index) => {
              const talla = tallas.find((t) => t.id === variante.talla_id)
              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{talla?.nombre}</td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={variante.stock_actual}
                      onChange={(e) =>
                        handleVarianteChange(index, 'stock_actual', e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={variante.stock_minimo}
                      onChange={(e) =>
                        handleVarianteChange(index, 'stock_minimo', e.target.value)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={variante.precio_venta}
                      onChange={(e) =>
                        handleVarianteChange(index, 'precio_venta', e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={variante.precio_compra}
                      onChange={(e) =>
                        handleVarianteChange(index, 'precio_compra', e.target.value)
                      }
                      className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={variante.estado ? 'activo' : 'inactivo'}
                      onChange={(e) =>
                        handleVarianteChange(index, 'estado', e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        ✓ {formData.variantes.length} variante{formData.variantes.length !== 1 ? 's' : ''} generada{formData.variantes.length !== 1 ? 's' : ''} ({formData.colores.length} color{formData.colores.length !== 1 ? 'es' : ''} × {formData.tallas.length} talla{formData.tallas.length !== 1 ? 's' : ''})
      </div>
    </div>
  )
}
