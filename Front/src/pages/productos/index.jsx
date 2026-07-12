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
  const { productos, setProductos, actualizarStock, productoDetalle, setProductoDetalle, setLoadingDetalle } = useProductoStore()
  const { setCurrentStep, setModo, setCodigoProductoId, cargarProductoEditarCompleto } = useWizardStore()

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
  
  const [catalogos, setCatalogos] = useState({
    marcas: [], tipos: [], materiales: [], colores: [], tallas: []
  })

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const [resMarcas, resTipos, resMateriales, resColores, resTallas] = await Promise.all([
          import('../../services/marcaService').then(m => m.marcaService.getAll()),
          import('../../services/tipoCalzadoService').then(m => m.tipoCalzadoService.getAll()),
          import('../../services/materialService').then(m => m.materialService.getAll()),
          import('../../services/colorService').then(m => m.colorService.getAll()),
          import('../../services/tallaService').then(m => m.tallaService.getAll())
        ])
        setCatalogos({
          marcas: resMarcas.data,
          tipos: resTipos.data,
          materiales: resMateriales.data,
          colores: resColores.data,
          tallas: resTallas.data
        })
      } catch (err) {
        console.error("Error cargando catálogos", err)
      }
    }
    fetchCatalogos()
  }, [])

  // Filtrado dinámico de catálogos basado en los productos actuales para evitar combinaciones sin resultados
  const getAvailableOptions = () => {
    // Si no hay productos cargados (ej. primera carga), devolver todos
    if (!productos || productos.length === 0) return catalogos;
    
    const availableMarcas = new Set();
    const availableTipos = new Set();
    const availableMateriales = new Set();
    const availableColores = new Set();
    const availableTallas = new Set();

    productos.forEach(p => {
      if (p.marca?.nombre) availableMarcas.add(p.marca.nombre.toLowerCase());
      if (p.tipo_calzado?.nombre) availableTipos.add(p.tipo_calzado.nombre.toLowerCase());
      if (p.material?.nombre) availableMateriales.add(p.material.nombre.toLowerCase());
      
      p.colores?.forEach(c => {
        if (c.color?.nombre) availableColores.add(c.color.nombre.toLowerCase());
        c.variantes?.forEach(v => {
          if (v.talla) availableTallas.add(v.talla.toLowerCase());
        });
      });
    });

    return {
      marcas: catalogos.marcas.filter(m => filters.marca || availableMarcas.has(m.nombre.toLowerCase())),
      tipos: catalogos.tipos.filter(t => filters.tipo || availableTipos.has(t.nombre.toLowerCase())),
      materiales: catalogos.materiales.filter(m => filters.material || availableMateriales.has(m.nombre.toLowerCase())),
      colores: catalogos.colores.filter(c => filters.color || availableColores.has(c.nombre.toLowerCase())),
      tallas: catalogos.tallas.filter(t => filters.talla || availableTallas.has(t.talla.toLowerCase()))
    };
  };

  const availableCatalogos = getAvailableOptions();

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    // Limpiar IDs si cambiamos el texto (para evitar conflictos)
    if (key === 'marca') newFilters.marca_id = ''
    if (key === 'tipo') newFilters.tipo_calzado_id = ''
    if (key === 'material') newFilters.material_id = ''
    if (key === 'color') newFilters.color_id = ''
    if (key === 'talla') newFilters.talla_id = ''
    
    setFilters(newFilters)
    loadProductos(cleanFilters(newFilters), isPapeleraMode)
    
    // Opcional: Cerrar panel de filtros si se selecciona algo, pero puede ser molesto si quieren seleccionar varios
  }

  const getActiveFilters = () => {
    const active = []
    if (filters.codigo) active.push({ label: 'Código', value: filters.codigo, onRemove: () => updateFilter('codigo', '') })
    
    // Preferir nombre, si no usar el ID buscado
    const marcaVal = filters.marca || (filters.marca_id ? catalogos.marcas.find(m => m.id == filters.marca_id)?.nombre : '')
    if (marcaVal) active.push({ label: 'Marca', value: marcaVal, onRemove: () => { updateFilter('marca', ''); updateFilter('marca_id', '') } })
    
    const tipoVal = filters.tipo || (filters.tipo_calzado_id ? catalogos.tipos.find(m => m.id == filters.tipo_calzado_id)?.nombre : '')
    if (tipoVal) active.push({ label: 'Tipo', value: tipoVal, onRemove: () => { updateFilter('tipo', ''); updateFilter('tipo_calzado_id', '') } })
    
    const matVal = filters.material || (filters.material_id ? catalogos.materiales.find(m => m.id == filters.material_id)?.nombre : '')
    if (matVal) active.push({ label: 'Material', value: matVal, onRemove: () => { updateFilter('material', ''); updateFilter('material_id', '') } })
    
    const colVal = filters.color || (filters.color_id ? catalogos.colores.find(m => m.id == filters.color_id)?.nombre : '')
    if (colVal) active.push({ label: 'Color', value: colVal, onRemove: () => { updateFilter('color', ''); updateFilter('color_id', '') } })
    
    const tallaVal = filters.talla || (filters.talla_id ? catalogos.tallas.find(m => m.id == filters.talla_id)?.talla : '')
    if (tallaVal) active.push({ label: 'Talla', value: tallaVal, onRemove: () => { updateFilter('talla', ''); updateFilter('talla_id', '') } })
    
    return active
  }
  
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
          onApply: () => { loadProductos(cleanFilters(filters), isPapeleraMode); setShowFilters(false); },
          activeFilters: getActiveFilters(),
          filters: (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Código</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Ej. PROD-01" 
                  value={filters.codigo} 
                  onChange={(e) => updateFilter('codigo', e.target.value)} 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Marca</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.marca} 
                  onChange={(e) => updateFilter('marca', e.target.value)}
                >
                  <option value="">Todas</option>
                  {availableCatalogos.marcas.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.tipo} 
                  onChange={(e) => updateFilter('tipo', e.target.value)}
                >
                  <option value="">Todos</option>
                  {availableCatalogos.tipos.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Material</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.material} 
                  onChange={(e) => updateFilter('material', e.target.value)}
                >
                  <option value="">Todos</option>
                  {availableCatalogos.materiales.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Color</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.color} 
                  onChange={(e) => updateFilter('color', e.target.value)}
                >
                  <option value="">Todos</option>
                  {availableCatalogos.colores.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Talla</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.talla} 
                  onChange={(e) => updateFilter('talla', e.target.value)}
                >
                  <option value="">Todas</option>
                  {availableCatalogos.tallas.map(m => (
                    <option key={m.id} value={m.talla}>{m.talla}</option>
                  ))}
                </select>
              </div>
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
