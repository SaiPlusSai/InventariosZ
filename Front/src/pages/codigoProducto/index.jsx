import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { ConfirmModal, EmptyState } from '../../components/ui'
import { useCodigoProductoStore } from '../../store/codigoProductoStore'
import { codigoProductoService } from '../../services/codigoProductoService'
import { marcaService } from '../../services/marcaService'
import { useWarningManager } from '../../hooks/useWarningManager'
import toast from 'react-hot-toast'
import { Trash2, Upload, Download, FileText, RotateCcw, Plus, Loader2 } from 'lucide-react'
import GenericImportarModal from '../../components/ui/GenericImportarModal'

export default function CodigoProducto() {
  const navigate = useNavigate()
  const { codigos, setCodigos, loading, setLoading, error, setError } = useCodigoProductoStore()
  
  const [marcas, setMarcas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCodigo, setEditingCodigo] = useState(null)
  
  const [formData, setFormData] = useState({ marca_id: '', codigo: '' })
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const loadData = async (papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      const [resCodigos, resMarcas] = await Promise.all([
        papelera ? codigoProductoService.getPapelera() : codigoProductoService.getAll(),
        marcaService.getAll()
      ])
      setCodigos(resCodigos.data)
      setMarcas(resMarcas.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los códigos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData(isPapeleraMode)
  }, [isPapeleraMode])

  const handleOpenModal = (codigo = null) => {
    if (codigo) {
      setEditingCodigo(codigo)
      setFormData({ marca_id: codigo.marca_id, codigo: codigo.codigo || '' })
    } else {
      setEditingCodigo(null)
      setFormData({ marca_id: '', codigo: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCodigo(null)
    setFormData({ marca_id: '', codigo: '' })
  }

  const { handleWarningError, WarningComponent } = useWarningManager(async (payloadWithForce) => {
    // Esta función se llama si el usuario confirma "Guardar de todas formas"
    if (editingCodigo) {
      await codigoProductoService.update(editingCodigo.id, payloadWithForce)
        toast.success('Registro actualizado correctamente')
    } else {
      await codigoProductoService.create(payloadWithForce)
        toast.success('Registro creado correctamente')
    }
    handleCloseModal()
    loadData()
  })

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        marca_id: parseInt(formData.marca_id, 10),
        codigo: formData.codigo
      }
      if (editingCodigo) {
        await codigoProductoService.update(editingCodigo.id, payload)
        toast.success('Registro actualizado correctamente')
      } else {
        await codigoProductoService.create(payload)
        toast.success('Registro creado correctamente')
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      console.error(err)
      const isWarning = handleWarningError(err, {
        marca_id: parseInt(formData.marca_id, 10),
        codigo: formData.codigo
      })
      if (!isWarning) {
        import('../../store/notificationStore').then(store => {
          store.useNotificationStore.getState().showNotification(
            'error',
            'Error',
            err.customMessage || 'Error al guardar el código de producto'
          )
        })
      }
    } finally {
      setSaving(false)
    }
  }


  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...')
      const response = await codigoProductoService.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'codigos_producto_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar a Excel')
    }
  }

  const handleDeleteClick = (codigo) => {
    setItemToDelete(codigo)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await codigoProductoService.recuperar(id)
      toast.success('Registro recuperado correctamente')
      loadData()
    } catch (err) {
      console.error(err)
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          err.customMessage || 'Error al recuperar el código'
        )
      })
    }
  }

  const handleSearch = () => {
    setAppliedSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    setAppliedSearch('')
  }

  const filteredCodigos = codigos.filter(item => {
    const term = appliedSearch.toLowerCase()
    const marca = marcas.find(m => m.id === item.marca_id)
    const marcaNombre = marca ? marca.nombre.toLowerCase() : ''
    return item.codigo.toLowerCase().includes(term) || marcaNombre.includes(term)
  })

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {isPapeleraMode ? 'Códigos de Producto (Papelera)' : 'Códigos de Producto'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isPapeleraMode ? 'Códigos inactivos' : 'Gestiona los códigos base de productos.'}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
          <Button variant="secondary" onClick={() => {
            setIsPapeleraMode(!isPapeleraMode)
            setSearchTerm('')
            setAppliedSearch('')
          }} className="flex-1 md:flex-none">
            {isPapeleraMode ? <><RotateCcw size={16} className="mr-2 inline"/> Volver a Activos</> : <><Trash2 size={16} className="mr-2 inline"/> Ver Papelera</>}
          </Button>
          {!isPapeleraMode && (
            <>
              <Button variant="secondary" onClick={() => setShowImportModal(true)} className="flex-1 md:flex-none" title="Importar Excel">
                <Upload size={16} className="mr-2 inline"/> Importar
              </Button>
              <Button variant="secondary" onClick={handleExportarExcel} className="flex-1 md:flex-none" title="Exportar a Excel">
                <Download size={16} className="mr-2 inline"/> Exportar
              </Button>
              <Button variant="primary" onClick={() => handleOpenModal()} className="flex-1 md:flex-none shadow-md shadow-primary-500/20">
                <Plus size={16} className="mr-2 inline"/> Nuevo Código
              </Button>
            </>
          )}
        </div>
      </div>
      <Card className="mb-6">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              🔍
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button variant="primary" onClick={handleSearch}>
            Filtrar
          </Button>
          <Button variant="secondary" onClick={handleClear}>
            Limpiar
          </Button>
        </div>
      </Card>

      <Card>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : codigos.length === 0 ? (
          <EmptyState 
            title={isPapeleraMode ? "Papelera vacía" : "No hay registros"}
            description={isPapeleraMode ? "No hay registros eliminados." : "Crea el primer registro para comenzar."}
            actionLabel={!isPapeleraMode ? "Nuevo Registro" : undefined}
            onAction={!isPapeleraMode ? () => handleOpenModal() : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-semibold text-gray-700">Código</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Marca</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodigos.map((item) => {
                  const marca = marcas.find((m) => m.id === item.marca_id)
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.codigo}</td>
                      <td className="py-3 px-4">{marca ? marca.nombre : item.marca_id}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isPapeleraMode ? (
                            <>
                              <Button variant="secondary" onClick={() => handleOpenModal(item)}>Editar</Button>
                              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(item)}>Eliminar</Button>
                              <Button variant="primary" onClick={() => navigate(`/productos?codigo=${item.codigo}`)}>Ver Variantes</Button>
                            </>
                          ) : (
                            <>
                              <Button variant="secondary" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(item.id)}>Recuperar</Button>
                              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(item)}>Elim. Definitivo</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCodigo ? 'Editar Código' : 'Nuevo Código'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <Input
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={formData.marca_id}
                  onChange={(e) => setFormData({ ...formData, marca_id: e.target.value })}
                >
                  <option value="">Seleccione una marca...</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving || !formData.marca_id || !formData.codigo}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
        onConfirm={async () => {
          if (isPapeleraMode) {
            await codigoProductoService.delete(itemToDelete.id)
            toast.success('Registro eliminado permanentemente')
          } else {
            await codigoProductoService.desactivar(itemToDelete.id)
            toast.success('Registro enviado a la papelera')
          }
          loadData()
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        title={isPapeleraMode ? 'Eliminar Permanentemente' : 'Eliminar Registro'}
        message={`¿Está seguro de ${isPapeleraMode ? 'eliminar permanentemente' : 'eliminar'} el registro "${itemToDelete?.nombre || itemToDelete?.codigo}"?`}
        confirmText={isPapeleraMode ? 'Eliminar Definitivamente' : 'Enviar a Papelera'}
        variant="danger"
        dependencyConfig={{
          service: codigoProductoService,
          itemId: itemToDelete?.id,
          isPhysicalDelete: isPapeleraMode
        }}
      />
      {WarningComponent}

      {showImportModal && (
        <GenericImportarModal 
          title="Importación de Códigos de Producto"
          description="Añade múltiples códigos usando un archivo Excel. La columna 'Marca' debe coincidir con el nombre de una marca existente."
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadData()
          }}
          descargarPlantillaFn={codigoProductoService.descargarPlantilla}
          importarPreviaFn={codigoProductoService.importarPrevia}
          importarConfirmarFn={codigoProductoService.importarConfirmar}
        />
      )}
    </div>
  )
}
