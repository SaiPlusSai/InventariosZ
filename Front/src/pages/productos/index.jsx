import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useProductoStore } from '../../store/productoStore'
import { productoService } from '../../services/productoService'
import ProductoWizard from './wizard/ProductoWizard'
import { formatCurrency, getStockLabel } from '../../utils/helpers'
import { useWizardStore } from '../../store/wizardStore'
import ProductoDetalle from './ProductoDetalle'
const emptyFilters = {
  codigo: '',
  marca: '',
  tipo: '',
  material: '',
  color: '',
  talla: '',
}

const cleanFilters = (filters) =>
  Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== '')
  )

export default function Productos() {
  const [searchParams] = useSearchParams()
  const initialFilters = {
    ...emptyFilters,
    marca_id: searchParams.get('marca_id') || '',
    color_id: searchParams.get('color_id') || '',
    material_id: searchParams.get('material_id') || '',
    talla_id: searchParams.get('talla_id') || '',
    tipo_calzado_id: searchParams.get('tipo_calzado_id') || '',
    codigo: searchParams.get('codigo') || '',
  }

  const [showWizard, setShowWizard] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilters)

 const {
  productos,
  productoDetalle,
  setProductos,
  setProductoDetalle,
  actualizarStock,
  loadingDetalle,
  setLoadingDetalle,
} = useProductoStore()
const { cargarProductoEditar } = useWizardStore()
  const loadProductos = async (params = {}) => {

    try {

      setLoading(true)

      const res = await productoService.getAll(params)

      setProductos(res.data)

    } catch (error) {

      console.error('Error loading productos:', error)

    } finally {

      setLoading(false)

    }

  }

useEffect(() => {

  loadProductos(cleanFilters(filters))

  const socket = new WebSocket(
    "ws://localhost:8000/productos/ws"
  )

  socket.onmessage = (event) => {

    const data = JSON.parse(event.data)

    if (data.tipo === "stock_actualizado") {

      actualizarStock(
        data.producto_id,
        data.stock_actual,
      )

    }

  }

  socket.onerror = (error) => {

    console.error(error)

  }

  return () => socket.close()

}, [])

  const handleFilterChange = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  const handleApplyFilters = () => {
    loadProductos(cleanFilters(filters))
  }

  const handleClearFilters = () => {
    setFilters(emptyFilters)
    loadProductos()
  }
  const handleVer = async (id) => {

  try {

    setLoadingDetalle(true)

    const res = await productoService.getDetalle(id)

    setProductoDetalle(res.data)

    setShowDetalle(true)

  } catch (error) {

    console.error('Error loading producto:', error)

  } finally {

    setLoadingDetalle(false)

  }

}
const handleEditar = async (codigoProductoId) => {

  try {

    const res =
      await productoService.getEditarCompleto(
        codigoProductoId
      )

    cargarProductoEditar(
      res.data
    )

    setShowWizard(true)

  } catch (error) {

    console.error(error)

  }

}
const handleIncrementarStock = async (id) => {

  try {

    await productoService.incrementarStock(id)

  } catch (error) {

    console.error(error)

  }

}

const handleDecrementarStock = async (id) => {

  try {

    await productoService.decrementarStock(id)

  } catch (error) {

    console.error(error)

  }

}
  return (
    <div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Productos
        </h1>

        <Button
          variant="primary"
          onClick={() => setShowWizard(true)}
        >
          + Nuevo Producto
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Input
            label="Codigo"
            value={filters.codigo}
            onChange={(event) => handleFilterChange('codigo', event.target.value)}
          />

          <Input
            label="Marca"
            value={filters.marca}
            onChange={(event) => handleFilterChange('marca', event.target.value)}
          />

          <Input
            label="Tipo"
            value={filters.tipo}
            onChange={(event) => handleFilterChange('tipo', event.target.value)}
          />

          <Input
            label="Material"
            value={filters.material}
            onChange={(event) => handleFilterChange('material', event.target.value)}
          />

          <Input
            label="Color"
            value={filters.color}
            onChange={(event) => handleFilterChange('color', event.target.value)}
          />

          <Input
            label="Talla"
            value={filters.talla}
            onChange={(event) => handleFilterChange('talla', event.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={handleApplyFilters}
          >
            Filtrar
          </Button>

          <Button
            variant="secondary"
            onClick={handleClearFilters}
          >
            Limpiar
          </Button>
        </div>
      </Card>

      {loading ? (

        <div className="text-center text-gray-600">
          Cargando productos...
        </div>

      ) : productos.length === 0 ? (

        <Card>

          <div className="text-center py-8">

            <p className="text-gray-500 text-lg">
              No hay productos registrados
            </p>

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

            <Card
              key={producto.id}
              className="hover:shadow-lg transition-shadow"
            >

              {producto.imagen_principal && (
                <img
                  src={producto.imagen_principal}
                  alt={producto.descripcion || producto.codigo}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-2 mb-4">

                <p className="text-sm text-gray-600">
                  {producto.marca?.nombre}
                </p>

                <h3 className="font-semibold text-lg">
                  {producto.descripcion || producto.codigo}
                </h3>

                <p className="text-sm text-gray-500">
                  Codigo: {producto.codigo}
                </p>

                <p className="text-sm text-gray-500">
                  Tipo: {producto.tipo_calzado?.nombre}
                </p>

                <p className="text-sm text-gray-500">
                  Material: {producto.material?.nombre}
                </p>

                <p className="text-sm text-gray-500">
                  Color: {producto.color?.nombre}
                </p>

                <p className="text-sm text-gray-500">
                  Talla: {producto.talla?.nombre}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">

                <div>

  <p className="text-gray-600">
    Stock
  </p>

  <div className="flex items-center gap-2">

    <Button
      variant="secondary"
      onClick={() =>
        handleDecrementarStock(producto.id)
      }
    >
      -
    </Button>

    <p className="font-bold text-lg w-10 text-center">
      {producto.stock_actual}
    </p>

    <Button
      variant="secondary"
      onClick={() =>
        handleIncrementarStock(producto.id)
      }
    >
      +
    </Button>

  </div>

</div>
                <div>

                  <p className="text-gray-600">
                    Precio
                  </p>

                  <p className="font-bold text-lg">
                    {formatCurrency(producto.precio_venta || 0)}
                  </p>

                </div>

              </div>

              <div className="mb-4 p-2 bg-gray-50 rounded">

                <p className="text-sm">
                  {getStockLabel(producto.stock_actual || 0)}
                </p>

              </div>

              <div className="flex gap-2">

                <Button
  variant="ghost"
  className="flex-1"
  onClick={() => handleVer(producto.id)}
>
  Ver
</Button>

                <Button
  variant="secondary"
  className="flex-1"
  onClick={() =>
    handleEditar(
      producto.codigo_producto_id
    )
  }
>
  Editar
</Button>

              </div>

            </Card>

          ))}

        </div>

      )}

      {showWizard && (
        <ProductoWizard
          onClose={() => setShowWizard(false)}
        />
      )}
        {showDetalle && (

  <ProductoDetalle
    producto={productoDetalle}
    onClose={() => setShowDetalle(false)}
  />

)}
    </div>
  )

}
