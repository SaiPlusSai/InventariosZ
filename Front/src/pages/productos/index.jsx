import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, Button, Input, ConfirmModal, EmptyState, ShareModal } from '../../components/ui'
import CrudToolbar from '../../components/ui/Crud/CrudToolbar'
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

import { agruparProductosPlanos } from '../../utils/adapters/productoAdapter'

export default function Productos() {
  const [searchParams] = useSearchParams()
  const { productos, setProductos, actualizarStock, productoDetalle, setProductoDetalle, setLoadingDetalle } = useProductoStore()
  const { setCurrentStep, setModo, setCodigoProductoId, cargarProductoEditarCompleto, resetWizard } = useWizardStore()

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
          if (v.talla?.nombre) availableTallas.add(v.talla.nombre.toLowerCase());
        });
      });
    });

    return {
      marcas: catalogos.marcas.filter(m => filters.marca || availableMarcas.has(m.nombre.toLowerCase())),
      tipos: catalogos.tipos.filter(t => filters.tipo || availableTipos.has(t.nombre.toLowerCase())),
      materiales: catalogos.materiales.filter(m => filters.material || availableMateriales.has(m.nombre.toLowerCase())),
      colores: catalogos.colores.filter(c => filters.color || availableColores.has(c.nombre.toLowerCase())),
      tallas: catalogos.tallas.filter(t => filters.talla || availableTallas.has(t.nombre.toLowerCase()))
    };
  };

  const availableCatalogos = getAvailableOptions();

  const updateFilters = (changes) => {
    const newFilters = { ...filters, ...changes }
    // Auto-limpiar IDs si cambiamos el texto explícitamente y no pasamos ID
    if ('marca' in changes && !('marca_id' in changes)) newFilters.marca_id = ''
    if ('tipo' in changes && !('tipo_calzado_id' in changes)) newFilters.tipo_calzado_id = ''
    if ('material' in changes && !('material_id' in changes)) newFilters.material_id = ''
    if ('color' in changes && !('color_id' in changes)) newFilters.color_id = ''
    if ('talla' in changes && !('talla_id' in changes)) newFilters.talla_id = ''
    
    setFilters(newFilters)
    loadProductos(cleanFilters(newFilters), isPapeleraMode)
  }

  const getActiveFilters = () => {
    const active = []
    if (filters.codigo) active.push({ label: 'Código', value: filters.codigo, onRemove: () => updateFilters({ codigo: '' }) })
    
    // Preferir nombre, si no usar el ID buscado
    const marcaVal = filters.marca || (filters.marca_id ? catalogos.marcas.find(m => m.id == filters.marca_id)?.nombre : '')
    if (marcaVal) active.push({ label: 'Marca', value: marcaVal, onRemove: () => updateFilters({ marca: '', marca_id: '' }) })
    
    const tipoVal = filters.tipo || (filters.tipo_calzado_id ? catalogos.tipos.find(m => m.id == filters.tipo_calzado_id)?.nombre : '')
    if (tipoVal) active.push({ label: 'Tipo', value: tipoVal, onRemove: () => updateFilters({ tipo: '', tipo_calzado_id: '' }) })
    
    const matVal = filters.material || (filters.material_id ? catalogos.materiales.find(m => m.id == filters.material_id)?.nombre : '')
    if (matVal) active.push({ label: 'Material', value: matVal, onRemove: () => updateFilters({ material: '', material_id: '' }) })
    
    const colVal = filters.color || (filters.color_id ? catalogos.colores.find(m => m.id == filters.color_id)?.nombre : '')
    if (colVal) active.push({ label: 'Color', value: colVal, onRemove: () => updateFilters({ color: '', color_id: '' }) })
    
    const tallaVal = filters.talla || (filters.talla_id ? catalogos.tallas.find(m => m.id == filters.talla_id)?.nombre : '')
    if (tallaVal) active.push({ label: 'Talla', value: tallaVal, onRemove: () => updateFilters({ talla: '', talla_id: '' }) })
    
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
        await loadProductos(cleanFilters(filters), true)
        setItemToDelete(null)
      } else {
        await productoService.desactivarColor(itemToDelete.codigoProductoId, itemToDelete.colorId)
        toast.success('Producto enviado a la papelera')
        await loadProductos(cleanFilters(filters), false)
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
      await loadProductos(cleanFilters(filters), isPapeleraMode)
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
      <CrudToolbar
        title={isPapeleraMode ? 'Papelera de Productos' : 'Catálogo Principal'}
        description={isPapeleraMode ? 'Gestión de productos inactivos' : 'Explora y administra tu inventario por modelos y colores.'}
        primaryActions={[
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
              label: "Nuevo Producto",
              icon: Plus,
              variant: "primary",
              className: "shadow-md shadow-primary-500/20",
              onClick: () => {
                resetWizard()
                setShowNewWizard(true)
              }
            }
          ] : [])
        ]}
        secondaryActions={!isPapeleraMode ? [
          {
            label: "Importar",
            icon: FileDown,
            title: "Importar Excel",
            onClick: () => setShowImportModal(true)
          },
          {
            label: "Exportar PDF",
            icon: FileText,
            title: "Exportar a PDF",
            onClick: handleExportarPdf
          },
          {
            label: "Exportar Excel",
            icon: FileUp,
            title: "Exportar a Excel",
            onClick: handleExportarExcel
          }
        ] : []}
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
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  placeholder="Ej. PROD-01" 
                  value={filters.codigo} 
                  onChange={(e) => updateFilters({ codigo: e.target.value })} 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Marca</label>
                <select 
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.marca} 
                  onChange={(e) => updateFilters({ marca: e.target.value })}
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
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.tipo} 
                  onChange={(e) => updateFilters({ tipo: e.target.value })}
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
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.material} 
                  onChange={(e) => updateFilters({ material: e.target.value })}
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
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.color} 
                  onChange={(e) => updateFilters({ color: e.target.value })}
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
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                  value={filters.talla} 
                  onChange={(e) => updateFilters({ talla: e.target.value })}
                >
                  <option value="">Todas</option>
                  {availableCatalogos.tallas.map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre}</option>
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
            <div className="flex items-center justify-center py-1.50">
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
              onAction={!isPapeleraMode ? () => {
                resetWizard()
                setShowNewWizard(true)
              } : undefined}
            />
          )
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          onClose={() => {
            resetWizard()
            setShowNewWizard(false)
          }}
          onSuccess={async () => { setShowNewWizard(false); await loadProductos(cleanFilters(filters), isPapeleraMode); }}
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
          onImportSuccess={async () => {
            setShowImportModal(false)
            await loadProductos(cleanFilters(filters), isPapeleraMode)
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
