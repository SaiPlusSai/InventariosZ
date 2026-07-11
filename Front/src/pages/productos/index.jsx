import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Input, ConfirmModal, EmptyState, ShareModal } from '../../components/ui'
import { useProductoStore } from '../../store/productoStore'
import { useWizardStore } from '../../store/wizardStore'
import { productoService } from '../../services/productoService'
import ProductoWizard from './wizard/ProductoWizard'
import ProductoDetalle from './ProductoDetalle'
import ProductoCard from './ProductoCard'
import ImportarModal from './ImportarModal'
import { Search, Filter, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp, Package, Download, FileText, UploadCloud } from 'lucide-react'
import toast from 'react-hot-toast'

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
    } else if (p.imagen_principal && !catalogoDict[cp_id].colores[color_id].imagen_principal) {
      catalogoDict[cp_id].colores[color_id].imagen_principal = p.imagen_principal
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
  const [globalSearch, setGlobalSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  
  // Modals States
  const [showNewWizard, setShowNewWizard] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDetalle, setShowDetalle] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null) // { codigoProductoId, colorId, nombre, colorNombre }
  
  // Share States
  const [showShareModal, setShowShareModal] = useState(false)
  const [itemToShare, setItemToShare] = useState(null) // { producto, colorInfo }
  
  const { productos, setProductos, actualizarStock, productoDetalle, setProductoDetalle, setLoadingDetalle } = useProductoStore()

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

  const handleVer = async (producto, colorInfo) => {
    try {
      setLoadingDetalle(true)
      const varianteId = colorInfo.variantes[0]?.id
      if (!varianteId) return

      const res = await productoService.getDetalle(varianteId)
      setProductoDetalle(res.data)
      setShowDetalle(true)
    } catch (error) {
      console.error('Error loading producto:', error)
    } finally {
      setLoadingDetalle(false)
    }
  }

  const { setCurrentStep, setModo, setCodigoProductoId, cargarProductoEditarCompleto } = useWizardStore()

  const handleEditar = async (producto, colorInfo) => {
    // Le decimos al Wizard que queremos editar el color especifico
    await cargarProductoEditarCompleto(producto.codigo_producto_id, colorInfo.color_id)
    setShowNewWizard(true)
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

  const confirmDelete = async () => {
    if (!itemToDelete) return
    try {
        if (isPapeleraMode) {
        await productoService.eliminarColorPermanente(itemToDelete.codigoProductoId, itemToDelete.colorId)
        toast.success('Producto eliminado permanentemente')
        loadProductos(cleanFilters(filters), true)
        setItemToDelete(null)
      } else {
        await productoService.desactivarColor(itemToDelete.codigoProductoId, itemToDelete.colorId)
        toast.success('Producto enviado a la papelera')
        loadProductos(cleanFilters(filters), false)
        setItemToDelete(null)
      }
    } catch (err) {
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          'Error eliminando: ' + (err.response?.data?.detail || err.message)
        )
      })
    }
  }

  const handleRecuperar = async (codigo_producto_id, color_id) => {
    try {
      await productoService.recuperarColor(codigo_producto_id, color_id)
      toast.success('Producto recuperado correctamente')
      loadProductos(cleanFilters(filters), isPapeleraMode)
    } catch (err) {
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          'Error al recuperar el producto'
        )
      })
    }
  }

  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...');
      const response = await productoService.exportarExcel(cleanFilters(filters));
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'productos_inventario.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.dismiss(loadingToast);
      toast.success('Excel exportado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al exportar a Excel');
      console.error(error);
    }
  }

  const handleExportarPdf = async () => {
    try {
      const loadingToast = toast.loading('Generando PDF...');
      const response = await productoService.exportarPdf(cleanFilters(filters));
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'productos_inventario.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.dismiss(loadingToast);
      toast.success('PDF exportado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al exportar a PDF');
      console.error(error);
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
             <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button variant="secondary" onClick={() => {
            setIsPapeleraMode(!isPapeleraMode)
            setFilters(emptyFilters)
            setGlobalSearch('')
          }} className="flex-1 md:flex-none">
            {isPapeleraMode ? <><RotateCcw size={16} className="mr-2"/> Volver a Activos</> : <><Trash2 size={16} className="mr-2"/> Ver Papelera</>}
          </Button>
          {!isPapeleraMode && (
            <>
              <Button variant="secondary" onClick={() => setShowImportModal(true)} className="flex-1 md:flex-none" title="Importar Excel">
                <UploadCloud size={16} className="mr-2"/> Importar
              </Button>
              <Button variant="secondary" onClick={handleExportarPdf} className="flex-1 md:flex-none" title="Exportar a PDF">
                <FileText size={16} className="mr-2"/> PDF
              </Button>
              <Button variant="secondary" onClick={handleExportarExcel} className="flex-1 md:flex-none" title="Exportar a Excel">
                <Download size={16} className="mr-2"/> Excel
              </Button>
              <Button variant="primary" onClick={() => setShowNewWizard(true)} className="flex-1 md:flex-none shadow-md shadow-primary-500/20">
                <Plus size={16} className="mr-2"/> Nuevo Producto
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Buscador y Filtros Combinados */}
      <Card className="mb-8 border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-stretch md:items-center">
          {/* Buscador Global */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3.5 bg-transparent border-none focus:ring-0 text-gray-700 text-base"
              placeholder="Buscar por nombre o descripción..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
          </div>
          
          {/* Separator (visible on desktop) */}
          <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>

          {/* Botón Filtros */}
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 font-medium transition-colors md:w-auto w-full md:border-none border-t border-gray-100 focus:outline-none
              ${showFilters ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Filter size={18} />
            <span>Filtros</span>
            {showFilters ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
          </button>
        </div>

        {/* Panel de Filtros Desplegable */}
        <div className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 border-t border-gray-100 bg-gray-50/50' : 'max-h-0 opacity-0'}`}>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Input label="Código" value={filters.codigo} onChange={(e) => setFilters({...filters, codigo: e.target.value})} />
              <Input label="Marca" value={filters.marca} onChange={(e) => setFilters({...filters, marca: e.target.value})} />
              <Input label="Tipo" value={filters.tipo} onChange={(e) => setFilters({...filters, tipo: e.target.value})} />
              <Input label="Material" value={filters.material} onChange={(e) => setFilters({...filters, material: e.target.value})} />
              <Input label="Color" value={filters.color} onChange={(e) => setFilters({...filters, color: e.target.value})} />
              <Input label="Talla" value={filters.talla} onChange={(e) => setFilters({...filters, talla: e.target.value})} />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={() => { setFilters(emptyFilters); loadProductos({}, isPapeleraMode); }}>
                Limpiar
              </Button>
              <Button variant="primary" className="w-full sm:w-auto" onClick={() => loadProductos(cleanFilters(filters), isPapeleraMode)}>
                <Search size={16} className="mr-2"/> Buscar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Grid de Productos */}
      {(() => {
        const filteredProductos = productos.filter((p) => {
          if (!globalSearch) return true
          const searchLower = globalSearch.toLowerCase()
          return (
            (p.codigo && p.codigo.toLowerCase().includes(searchLower)) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(searchLower))
          )
        })

        if (loading) {
          return (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          )
        }

        if (filteredProductos.length === 0) {
          return (
            <EmptyState 
              icon={Package}
              title={isPapeleraMode ? "La papelera está vacía" : "No se encontraron productos"}
              description={isPapeleraMode ? "No hay productos eliminados temporalmente." : "Intenta ajustar los filtros de búsqueda o crea uno nuevo."}
              actionLabel={!isPapeleraMode ? "Nuevo Producto" : undefined}
              onAction={!isPapeleraMode ? () => setShowNewWizard(true) : undefined}
            />
          )
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProductos.flatMap((producto) =>
              producto.colores.map((colorInfo) => (
                <ProductoCard
                  key={`${producto.codigo_producto_id}-${colorInfo.color_id}`}
                  producto={producto}
                  color={colorInfo}
                  isPapeleraMode={isPapeleraMode}
                  onVer={() => handleVer(producto, colorInfo)}
                  onEditar={() => handleEditar(producto, colorInfo)}
                  onCompartir={() => {
                    setItemToShare({ producto, colorInfo })
                    setShowShareModal(true)
                  }}
                  onEliminar={() => setItemToDelete({
                    codigoProductoId: producto.codigo_producto_id, 
                    colorId: colorInfo.color_id, 
                    nombre: producto.descripcion || producto.codigo,
                    colorNombre: colorInfo.color.nombre
                  })}
                  onRecuperar={() => handleRecuperar(producto.codigo_producto_id, colorInfo.color_id)}
                  onIncrementar={handleIncrementarStock}
                  onDecrementar={handleDecrementarStock}
                />
              ))
            )}
          </div>
        )
      })()}

      {/* Delete Modal custom for Colors */}
      {/* Delete Modal custom for Products */}
      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title={isPapeleraMode ? 'Eliminar Permanentemente' : 'Desactivar Producto'}
        message={`¿Estás seguro de ${isPapeleraMode ? 'eliminar permanentemente' : 'desactivar'} el producto "${itemToDelete?.nombre}" (Color ${itemToDelete?.colorNombre}), incluyendo todas sus tallas?${isPapeleraMode ? '\nEsta acción no se puede deshacer.' : ''}`}
        confirmText={isPapeleraMode ? 'Eliminar Definitivamente' : 'Desactivar Producto'}
        variant="danger"
        dependencyConfig={{
          service: productoService,
          itemId: itemToDelete?.colorId, 
          isPhysicalDelete: isPapeleraMode
        }}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false)
          setItemToShare(null)
        }}
        onShare={async (providerId) => {
          if (!itemToShare) return;
          try {
            // Importación dinámica para mantener el bundle pequeño
            const { ShareFactory } = await import('../../providers/ShareProviders');
            const { shareService } = await import('../../services/shareService');
            
            const payload = shareService.prepareSharePayload(itemToShare.producto, itemToShare.colorInfo);
            const provider = ShareFactory.getProvider(providerId);
            
            await provider.share(payload);
            toast.success('¡Compartido exitosamente!');
          } catch (error) {
            console.error('Error al compartir:', error);
            toast.error(error.message || 'Error al intentar compartir.');
          } finally {
            setShowShareModal(false);
          }
        }}
      />

      {/* Creacion de todo el Producto (Wizard Antiguo de Creacion Completa) */}
      {showNewWizard && (
        <ProductoWizard
          onClose={() => setShowNewWizard(false)}
          onSuccess={() => { setShowNewWizard(false); loadProductos(cleanFilters(filters), isPapeleraMode); }}
        />
      )}

      {/* Renderizar el modal original de detalles */}
      {showDetalle && productoDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => {
            setShowDetalle(false)
            setProductoDetalle(null)
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportarModal 
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadProductos(cleanFilters(filters), isPapeleraMode)
          }}
        />
      )}

    </div>
  )
}
