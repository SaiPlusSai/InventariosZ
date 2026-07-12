import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Input, ConfirmModal, EmptyState, ShareModal, CrudHeader } from '../../components/ui'
import { useProductoStore } from '../../store/productoStore'
import { useWizardStore } from '../../store/wizardStore'
import { productoService } from '../../services/productoService'
import ProductoWizard from './wizard/ProductoWizard'
import ProductoDetalle from './ProductoDetalle'
import ProductoCard from './ProductoCard'
import ImportarModal from './ImportarModal'
import MovimientoModal from './movimientos/MovimientoModal.jsx'
import { Search, Filter, Plus, Trash2, RotateCcw, ChevronDown, ChevronUp, Package, Download, FileText, Upload , FileDown, FileUp} from 'lucide-react'
import toast from 'react-hot-toast'
import { ENV } from '../../config/env'

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
  const [itemToDelete, setItemToDelete] = useState(null)
  
  // Share States
  const [showShareModal, setShowShareModal] = useState(false)
  const [itemToShare, setItemToShare] = useState(null)
  
  // Movimiento Modal States
  const [movimientoModalOpen, setMovimientoModalOpen] = useState(false)
  const [movimientoProductoId, setMovimientoProductoId] = useState(null)
  const [movimientoStockActual, setMovimientoStockActual] = useState(0)
  const [movimientoPolaridad, setMovimientoPolaridad] = useState(null)
  
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
    const socket = new WebSocket(`${ENV.websocketUrl}/productos/ws`)
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
    await cargarProductoEditarCompleto(producto.codigo_producto_id, colorInfo.color_id)
    setShowNewWizard(true)
  }

  const handleIncrementarStock = (id, stock_actual) => {
    setMovimientoProductoId(id)
    setMovimientoStockActual(stock_actual)
    setMovimientoPolaridad('ENTRADA')
    setMovimientoModalOpen(true)
  }

  const handleDecrementarStock = (id, stock_actual) => {
    setMovimientoProductoId(id)
    setMovimientoStockActual(stock_actual)
    setMovimientoPolaridad('SALIDA')
    setMovimientoModalOpen(true)
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
      <CrudHeader
        title={isPapeleraMode ? 'Papelera de Productos' : 'Catálogo Principal'}
        description={isPapeleraMode ? 'Gestión de productos inactivos' : 'Explora y administra tu inventario por modelos y colores.'}
        actions={[
          {
            label: isPapeleraMode ? "Volver a Activos" : "Ver Papelera",
            icon: isPapeleraMode ? RotateCcw : Trash2,
            variant: "secondary",
            onClick: () => {
              setIsPapeleraMode(!isPapeleraMode)
              setFilters(emptyFilters)
              setGlobalSearch('')
            }
          },
          ...(!isPapeleraMode ? [
            {
              label: "Importar",
              icon: FileDown,
              variant: "secondary",
              title: "Importar Excel",
              onClick: () => setShowImportModal(true)
            },
            {
              label: "PDF",
              icon: FileText,
              variant: "secondary",
              title: "Exportar a PDF",
              onClick: handleExportarPdf
            },
            {
              label: "Exportar",
              icon: FileUp,
              variant: "secondary",
              title: "Exportar a Excel",
              onClick: handleExportarExcel
            },
            {
              label: "Nuevo Producto",
              icon: Plus,
              variant: "primary",
              className: "shadow-md shadow-primary-500/20",
              onClick: () => setShowNewWizard(true)
            }
          ] : [])
        ]}
        searchConfig={{
          placeholder: "Buscar por nombre o descripción...",
          value: globalSearch,
          onChange: setGlobalSearch
        }}
        filterConfig={{
          showFilters,
          onToggle: () => setShowFilters(!showFilters),
          onClear: () => { setFilters(emptyFilters); loadProductos({}, isPapeleraMode); },
          onApply: () => loadProductos(cleanFilters(filters), isPapeleraMode),
          filters: (
            <>
              <Input label="Código" value={filters.codigo} onChange={(e) => setFilters({...filters, codigo: e.target.value})} />
              <Input label="Marca" value={filters.marca} onChange={(e) => setFilters({...filters, marca: e.target.value})} />
              <Input label="Tipo" value={filters.tipo} onChange={(e) => setFilters({...filters, tipo: e.target.value})} />
              <Input label="Material" value={filters.material} onChange={(e) => setFilters({...filters, material: e.target.value})} />
              <Input label="Color" value={filters.color} onChange={(e) => setFilters({...filters, color: e.target.value})} />
              <Input label="Talla" value={filters.talla} onChange={(e) => setFilters({...filters, talla: e.target.value})} />
            </>
          )
        }}
      />

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

      {showNewWizard && (
        <ProductoWizard
          onClose={() => setShowNewWizard(false)}
          onSuccess={() => { setShowNewWizard(false); loadProductos(cleanFilters(filters), isPapeleraMode); }}
        />
      )}

      {showDetalle && productoDetalle && (
        <ProductoDetalle
          producto={productoDetalle}
          onClose={() => {
            setShowDetalle(false)
            setProductoDetalle(null)
          }}
        />
      )}

      {showImportModal && (
        <ImportarModal 
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadProductos(cleanFilters(filters), isPapeleraMode)
          }}
        />
      )}

      {movimientoModalOpen && (
        <MovimientoModal
          productoId={movimientoProductoId}
          stockActual={movimientoStockActual}
          preselectedPolarity={movimientoPolaridad}
          onClose={() => {
            setMovimientoModalOpen(false)
            loadProductos(cleanFilters(filters), isPapeleraMode)
          }}
        />
      )}

    </div>
  )
}
