import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useProductoStore } from '../../store/productoStore'
import { productoService } from '../../services/productoService'
import ProductoWizard from './wizard/ProductoWizard'
import ProductoColorWizard from './wizard/ProductoColorWizard'
import ProductoColorDetalle from './ProductoColorDetalle'
import ProductoCard from './ProductoCard'
import { Search, Filter, Plus, Trash2, RotateCcw } from 'lucide-react'

const emptyFilters = {
  codigo: '', marca: '', tipo: '', material: '', color: '', talla: '',
}

const cleanFilters = (filters) => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''))

const agruparProductosPlanos = (productosPlanos) => {
  const catalogoDict = {}
  for (const p of productosPlanos) {
    const cp_id = p.codigo_producto_id
    if (!catalogoDict[cp_id]) {
      catalogoDict[cp_id] = {
        codigo_producto_id: cp_id, codigo: p.codigo, marca: p.marca,
        tipo_calzado: p.tipo_calzado, material: p.material, descripcion: p.descripcion, colores: {}
      }
    }
    const color_id = p.color.id
    if (!catalogoDict[cp_id].colores[color_id]) {
      catalogoDict[cp_id].colores[color_id] = { color_id: color_id, color: p.color, imagen_principal: p.imagen_principal, variantes: [] }
    }
    catalogoDict[cp_id].colores[color_id].variantes.push({
      id: p.id, talla: p.talla, stock_actual: p.stock_actual, stock_minimo: p.stock_minimo,
      stock_maximo: p.stock_maximo, precio_compra: p.precio_compra, precio_venta: p.precio_venta, estado: p.estado
    })
  }
  return Object.values(catalogoDict).map(cp => ({ ...cp, colores: Object.values(cp.colores) }))
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

  // UI States
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(initialFilters)
  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  
  // Modals States
  const [showNewWizard, setShowNewWizard] = useState(false)
  const [editingColor, setEditingColor] = useState(null) // { codigoProductoId, colorId }
  const [viewingColor, setViewingColor] = useState(null) // { productoCompleto, colorId }
  const [itemToDelete, setItemToDelete] = useState(null) // { codigoProductoId, colorId, nombre, colorNombre }
  
  const { productos, setProductos, actualizarStock } = useProductoStore()

  const loadProductos = async (params = {}, papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      let data = []
      if (papelera) {
        const res = await productoService.getPapelera(params)
        data = agruparProductosPlanos(res.data)
      } else {
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

  useEffect(() => { loadProductos(cleanFilters(filters), isPapeleraMode) }, [isPapeleraMode])

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8000/productos/ws")
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.tipo === "stock_actualizado") actualizarStock(data.producto_id, data.stock_actual)
    }
    return () => socket.close()
  }, [])

  const handleVer = (producto, colorInfo) => {
    setViewingColor({ productoCompleto: producto, colorInfo: colorInfo })
  }

  const handleEditar = (producto, colorInfo) => {
    setEditingColor({ codigoProductoId: producto.codigo_producto_id, colorId: colorInfo.color_id, productoCompleto: producto, colorInfo: colorInfo })
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
      if (isPapeleraMode) {
        // Asumiendo que quisieramos eliminar fisico, por ahora la API dice desactivar. 
        // Eliminacion fisica de color no está añadida. Mostramos error temporal.
        alert('La eliminación física masiva no está implementada aún.')
      } else {
        await productoService.desactivarColor(itemToDelete.codigoProductoId, itemToDelete.colorId)
        loadProductos(cleanFilters(filters), isPapeleraMode)
        setItemToDelete(null)
      }
    } catch (err) {
      alert('Error eliminando: ' + (err.response?.data?.detail || err.message))
    }
  }

  const handleRecuperar = async (codigo_producto_id, color_id) => {
    try {
      await productoService.recuperarColor(codigo_producto_id, color_id)
      loadProductos(cleanFilters(filters), isPapeleraMode)
    } catch (err) {
      alert('Error al recuperar el color')
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {isPapeleraMode ? 'Papelera de Productos' : 'Catálogo Principal'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isPapeleraMode ? 'Gestión de productos inactivos' : 'Explora y administra tu inventario por modelos y colores.'}
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="secondary" onClick={() => {
            setIsPapeleraMode(!isPapeleraMode)
            setFilters(emptyFilters)
          }} className="flex-1 md:flex-none">
            {isPapeleraMode ? <><RotateCcw size={16} className="mr-2"/> Volver a Activos</> : <><Trash2 size={16} className="mr-2"/> Ver Papelera</>}
          </Button>
          {!isPapeleraMode && (
            <Button variant="primary" onClick={() => setShowNewWizard(true)} className="flex-1 md:flex-none shadow-md shadow-primary-500/20">
              <Plus size={16} className="mr-2"/> Nuevo Producto
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Modernos */}
      <Card className="mb-8 border-gray-100 shadow-sm bg-white overflow-hidden">
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Filter size={18} className="text-gray-400"/> Filtros de Búsqueda
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Input label="Código" value={filters.codigo} onChange={(e) => setFilters({...filters, codigo: e.target.value})} />
            <Input label="Marca" value={filters.marca} onChange={(e) => setFilters({...filters, marca: e.target.value})} />
            <Input label="Tipo" value={filters.tipo} onChange={(e) => setFilters({...filters, tipo: e.target.value})} />
            <Input label="Material" value={filters.material} onChange={(e) => setFilters({...filters, material: e.target.value})} />
            <Input label="Color" value={filters.color} onChange={(e) => setFilters({...filters, color: e.target.value})} />
            <Input label="Talla" value={filters.talla} onChange={(e) => setFilters({...filters, talla: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => { setFilters(emptyFilters); loadProductos({}, isPapeleraMode); }}>
              Limpiar
            </Button>
            <Button variant="primary" onClick={() => loadProductos(cleanFilters(filters), isPapeleraMode)}>
              <Search size={16} className="mr-2"/> Buscar
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid de Productos */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">No se encontraron productos</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Intenta ajustar los filtros o agrega un nuevo producto al catálogo para comenzar.
          </p>
          {!isPapeleraMode && (
            <Button variant="primary" onClick={() => setShowNewWizard(true)}>
              Crear el primer producto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.flatMap((producto) =>
            producto.colores.map((colorInfo) => (
              <ProductoCard
                key={`${producto.codigo_producto_id}-${colorInfo.color_id}`}
                producto={producto}
                color={colorInfo}
                isPapeleraMode={isPapeleraMode}
                onVer={() => handleVer(producto, colorInfo)}
                onEditar={() => handleEditar(producto, colorInfo)}
                onEliminar={() => setItemToDelete({
                  codigoProductoId: producto.codigo_producto_id, 
                  colorId: colorInfo.color_id, 
                  nombre: producto.descripcion || producto.codigo,
                  colorNombre: colorInfo.color.nombre
                })}
                onRecuperar={() => handleRecuperar(producto.codigo_producto_id, colorInfo.color_id)}
              />
            ))
          )}
        </div>
      )}

      {/* Delete Modal custom for Colors */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className={`px-6 py-4 border-b ${isPapeleraMode ? 'bg-red-50' : 'bg-orange-50'}`}>
              <h2 className={`text-xl font-bold ${isPapeleraMode ? 'text-red-700' : 'text-orange-700'}`}>
                {isPapeleraMode ? 'Eliminar Permanentemente' : 'Desactivar Color'}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-800 text-lg">
                ¿Estás seguro de desactivar <strong>todas las tallas</strong> del color <span className="font-bold text-primary-600">{itemToDelete.colorNombre}</span> para el producto <strong>{itemToDelete.nombre}</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-4">
                El color dejará de mostrarse en el catálogo principal, pero podrás recuperarlo desde la papelera.
              </p>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setItemToDelete(null)}>Cancelar</Button>
              <Button variant="primary" className="bg-orange-500 hover:bg-orange-600 border-none" onClick={confirmDelete}>
                Desactivar Color
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Creacion de todo el Producto (Wizard Antiguo de Creacion Completa) */}
      {showNewWizard && (
        <ProductoWizard
          onClose={() => setShowNewWizard(false)}
          onSuccess={() => { setShowNewWizard(false); loadProductos(cleanFilters(filters), isPapeleraMode); }}
        />
      )}

      {/* Wizard de Edicion Específico de un Color */}
      {editingColor && (
        <ProductoColorWizard
          codigoProductoId={editingColor.codigoProductoId}
          colorId={editingColor.colorId}
          productoData={editingColor.productoCompleto}
          colorInfo={editingColor.colorInfo}
          onClose={() => setEditingColor(null)}
          onSuccess={() => { setEditingColor(null); loadProductos(cleanFilters(filters), isPapeleraMode); }}
        />
      )}

      {/* Detalle de un Color Específico */}
      {viewingColor && (
        <ProductoColorDetalle
          productoCompleto={viewingColor.productoCompleto}
          targetColorId={viewingColor.colorId}
          onClose={() => setViewingColor(null)}
        />
      )}

    </div>
  )
}
