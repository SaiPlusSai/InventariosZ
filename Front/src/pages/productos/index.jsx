import { useState, useEffect } from 'react'
import { Card, Button } from '../../components/ui'
import { useProductoStore } from '../../store/productoStore'
import { productoService } from '../../services/productoService'
import ProductoWizard from './wizard/ProductoWizard'
import { formatCurrency, getStockLabel } from '../../utils/helpers'

export default function Productos() {
  const [showWizard, setShowWizard] = useState(false)
  const [loading, setLoading] = useState(true)
  const { productos, setProductos } = useProductoStore()

  useEffect(() => {
    const loadProductos = async () => {
      try {
        const res = await productoService.getAll()
        setProductos(res.data.data || res.data)
      } catch (error) {
        console.error('Error loading productos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProductos()
  }, [])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Button
          variant="primary"
          onClick={() => setShowWizard(true)}
        >
          + Nuevo Producto
        </Button>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Cargando productos...</div>
      ) : productos.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay productos registrados</p>
            <Button
              variant="primary"
              onClick={() => setShowWizard(true)}
              className="mt-4"
            >
              Crear el primer producto
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <Card key={producto.id} className="hover:shadow-lg transition-shadow">
              {/* Imagen */}
              {producto.imagen_principal && (
                <img
                  src={producto.imagen_principal}
                  alt={producto.descripcion}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              {/* Info */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">{producto.marca?.nombre}</p>
                <h3 className="font-semibold text-lg">{producto.descripcion}</h3>
                <p className="text-sm text-gray-500">Código: {producto.codigo}</p>
                <p className="text-sm text-gray-500">Tipo: {producto.tipo_calzado?.nombre}</p>
              </div>

              {/* Stock y Precio */}
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Stock Total</p>
                  <p className="font-bold text-lg">{producto.stock_total || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Precio</p>
                  <p className="font-bold text-lg">
                    {formatCurrency(producto.precio_promedio || 0)}
                  </p>
                </div>
              </div>

              {/* Estado Stock */}
              <div className="mb-4 p-2 bg-gray-50 rounded">
                <p className="text-sm">{getStockLabel(producto.stock_total || 0)}</p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1">
                  👁️ Ver
                </Button>
                <Button variant="secondary" className="flex-1">
                  ✎ Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      {showWizard && <ProductoWizard onClose={() => setShowWizard(false)} />}
    </div>
  )
}
