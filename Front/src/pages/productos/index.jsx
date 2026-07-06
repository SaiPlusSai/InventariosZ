import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useProductoStore } from '../../store/productoStore'
import { productoService } from '../../services/productoService'
import ProductoWizard from './wizard/ProductoWizard'
import { useWizardStore } from '../../store/wizardStore'
import ProductoDetalle from './ProductoDetalle'
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal'
import ProductoCard from './ProductoCard'

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

// Helper para agrupar productos planos (usado solo para la Papelera, 
// ya que el endpoint /catalogo ya los trae agrupados)
const agruparProductosPlanos = (productosPlanos) => {
  const catalogoDict = {}
  
  for (const p of productosPlanos) {
    const cp_id = p.codigo_producto_id
    if (!catalogoDict[cp_id]) {
      catalogoDict[cp_id] = {
        codigo_producto_id: cp_id,
        codigo: p.codigo,
        marca: p.marca,
        tipo_calzado: p.tipo_calzado,
        material: p.material,
        descripcion: p.descripcion,
        colores: {}
      }
    }
    
    const coloresDict = catalogoDict[cp_id].colores
    const color_id = p.color.id
    
    if (!coloresDict[color_id]) {
      coloresDict[color_id] = {
        color_id: color_id,
        color: p.color,
        imagen_principal: p.imagen_principal,
        variantes: []
      }
    }
    
    coloresDict[color_id].variantes.push({
      id: p.id,
      talla: p.talla,
      stock_actual: p.stock_actual,
      stock_minimo: p.stock_minimo,
      stock_maximo: p.stock_maximo,
      precio_compra: p.precio_compra,
      precio_venta: p.precio_venta,
      estado: p.estado
    })
  }
  
  return Object.values(catalogoDict).map(cp => ({
    ...cp,
    colores: Object.values(cp.colores)
  }))
}

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
  
  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const {
    productos,
    productoDetalle,
    setProductos,
    setProductoDetalle,
    actualizarStock,
    loadingDetalle,
    setLoadingDetalle,
  } = useProductoStore()

  const { cargarProductoEditarCompleto } = useWizardStore()

  const loadProductos = async (params = {}, papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      let data = []
      
      if (papelera) {
        // Papelera sigue usando getPapelera (plano) y lo agrupamos en frontend
        const res = await productoService.getPapelera(params)
        data = agruparProductosPlanos(res.data)
      } else {
        // Catálogo principal usa el nuevo endpoint super-optimizado
        const res = await productoService.getCatalogo(params)
        data = res.data
      }

      setProductos(data)
    } catch (error) {
      console.error('Error loading productos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductos(cleanFilters(filters), isPapeleraMode)
  }, [isPapeleraMode])

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/productos/ws")
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.tipo === "stock_actualizado") {
        actualizarStock(data.producto_id, data.stock_actual)
      }
    }
    socket.onerror = (error) => console.error(error)
    return () => socket.close()
  }, [])

  const handleFilterChange = (field, value) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [field]: value,
    }))
  }

  const handleApplyFilters = () => {
    loadProductos(cleanFilters(filters), isPapeleraMode)
  }

  const handleClearFilters = () => {
    setFilters(emptyFilters)
    loadProductos({}, isPapeleraMode)
  }

  const handleVer = async (color_id) => {
    // La logica anterior usaba ID de Variante. Para simplificar,
    // podríamos buscar el primer ID de variante de este color y mostrarlo,
    // o adaptar ProductoDetalle. Como el endpoint pide ID de variante:
    console.log("Ver detalle del color", color_id)
    // Pendiente: Adaptar si es necesario, pero por ahora mostramos un alert
    alert(`Abrir detalle para el color ${color_id}`)
  }

  const handleEditar = async (codigoProductoId) => {
    try {
      await cargarProductoEditarCompleto(codigoProductoId)
      setShowWizard(true)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteClick = (producto) => {
    setItemToDelete(producto)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (variante_id) => {
    try {
      await productoService.recuperar(variante_id)
      loadProductos(cleanFilters(filters), isPapeleraMode)
    } catch (err) {
      console.error(err)
      alert('Error al recuperar el producto')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isPapeleraMode ? 'Productos (Papelera)' : 'Catálogo de Productos'}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setIsPapeleraMode(!isPapeleraMode)
            setFilters(emptyFilters)
          }}>
            {isPapeleraMode ? 'Volver a Activos' : 'Ver Papelera'}
          </Button>
          {!isPapeleraMode && (
            <Button variant="primary" onClick={() => setShowWizard(true)}>
              + Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Input label="Codigo" value={filters.codigo} onChange={(e) => handleFilterChange('codigo', e.target.value)} />
          <Input label="Marca" value={filters.marca} onChange={(e) => handleFilterChange('marca', e.target.value)} />
          <Input label="Tipo" value={filters.tipo} onChange={(e) => handleFilterChange('tipo', e.target.value)} />
          <Input label="Material" value={filters.material} onChange={(e) => handleFilterChange('material', e.target.value)} />
          <Input label="Color" value={filters.color} onChange={(e) => handleFilterChange('color', e.target.value)} />
          <Input label="Talla" value={filters.talla} onChange={(e) => handleFilterChange('talla', e.target.value)} />
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="primary" onClick={handleApplyFilters}>Filtrar</Button>
          <Button variant="secondary" onClick={handleClearFilters}>Limpiar</Button>
        </div>
      </Card>

      {loading ? (
        <div className="text-center text-gray-600">Cargando productos...</div>
      ) : productos.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No hay productos registrados</p>
            <Button variant="primary" onClick={() => setShowWizard(true)} className="mt-4">
              Crear el primer producto
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.flatMap((producto) =>
            producto.colores.map((colorInfo) => (
              <ProductoCard
                key={`${producto.codigo_producto_id}-${colorInfo.color_id}`}
                producto={producto}
                color={colorInfo}
                isPapeleraMode={isPapeleraMode}
                onVer={(colorId) => handleVer(colorId)}
                onEditar={() => handleEditar(producto.codigo_producto_id)}
                onEliminar={() => handleDeleteClick(producto)}
                onRecuperar={() => handleRecuperar(colorInfo.variantes[0]?.id)}
              />
            ))
          )}
        </div>
      )}

      {showWizard && (
        <ProductoWizard
          onClose={() => setShowWizard(false)}
          onSuccess={() => {
            setShowWizard(false)
            loadProductos(cleanFilters(filters), isPapeleraMode)
          }}
        />
      )}

      {showDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => setShowDetalle(false)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
        onConfirm={() => loadProductos(cleanFilters(filters), isPapeleraMode)}
        service={productoService}
        item={itemToDelete}
        isPhysicalDelete={isPapeleraMode}
      />
    </div>
  )
}
