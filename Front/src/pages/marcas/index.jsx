import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, CrudHeader } from '../../components/ui'
import { ConfirmModal, EmptyState } from '../../components/ui'
import { useMarcaStore } from '../../store/marcaStore'
import { marcaService } from '../../services/marcaService'
import { useRecoveryManager } from '../../hooks/useRecoveryManager'
import toast from 'react-hot-toast'
import { Trash2, Upload, Download, FileText, RotateCcw, Plus, Loader2 , FileDown, FileUp} from 'lucide-react'
import GenericImportarModal from '../../components/ui/GenericImportarModal'

export default function Marcas() {
  const navigate = useNavigate()
  const { marcas, setMarcas, loading, setLoading, error, setError } = useMarcaStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingMarca, setEditingMarca] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [showImportModal, setShowImportModal] = useState(false)
  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [errorModal, setErrorModal] = useState(null)

  const { handleRecoveryError, RecoveryComponent } = useRecoveryManager(marcaService, () => {
    handleCloseModal()
    loadMarcas()
  })

  const loadMarcas = async (papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      const res = papelera ? await marcaService.getPapelera() : await marcaService.getAll()
      setMarcas(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las marcas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMarcas(isPapeleraMode)
  }, [isPapeleraMode])

  const handleOpenModal = (marca = null) => {
    if (marca) {
      setEditingMarca(marca)
      setFormData({ nombre: marca.nombre, descripcion: marca.descripcion || '' })
    } else {
      setEditingMarca(null)
      setFormData({ nombre: '', descripcion: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMarca(null)
    setFormData({ nombre: '', descripcion: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingMarca) {
        await marcaService.update(editingMarca.id, formData)
        toast.success('Marca actualizada correctamente')
      } else {
        await marcaService.create(formData)
        toast.success('Marca creada correctamente')
      }
      handleCloseModal()
      loadMarcas()
    } catch (err) {
      if (!handleRecoveryError(err, formData.nombre)) {
        setErrorModal(err.customMessage || 'Error al guardar la marca')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...')
      const response = await marcaService.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'marcas_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar a Excel')
    }
  }

  const handleDeleteClick = (marca) => {
    setItemToDelete(marca)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await marcaService.recuperar(id)
      toast.success('Marca recuperada correctamente')
      loadMarcas()
    } catch (err) {
      console.error(err)
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          'Error al recuperar la marca'
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

  const filteredMarcas = marcas.filter(marca => 
    marca.nombre.toLowerCase().includes(appliedSearch.toLowerCase()) || 
    (marca.descripcion && marca.descripcion.toLowerCase().includes(appliedSearch.toLowerCase()))
  )

  return (
    <div>
      <CrudHeader
        title={isPapeleraMode ? 'Marcas (Papelera)' : 'Marcas'}
        description={isPapeleraMode ? 'Marcas inactivas' : 'Gestiona las marcas registradas.'}
        actions={[
          {
            label: isPapeleraMode ? "Volver a Activos" : "Ver Papelera",
            icon: isPapeleraMode ? RotateCcw : Trash2,
            variant: "secondary",
            onClick: () => {
              setIsPapeleraMode(!isPapeleraMode)
              setSearchTerm('')
              setAppliedSearch('')
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
              label: "Exportar",
              icon: FileUp,
              variant: "secondary",
              title: "Exportar a Excel",
              onClick: handleExportarExcel
            },
            {
              label: "Nueva Marca",
              icon: Plus,
              variant: "primary",
              className: "shadow-md shadow-primary-500/20",
              onClick: () => handleOpenModal()
            }
          ] : [])
        ]}
        searchConfig={{
          placeholder: "Buscar por nombre o descripción...",
          value: searchTerm,
          onChange: setSearchTerm,
          onSearch: handleSearch,
          onClear: handleClear
        }}
      />

      <Card>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : marcas.length === 0 ? (
          <EmptyState 
            title={isPapeleraMode ? "Papelera vacía" : "No hay marcas registradas"}
            description={isPapeleraMode ? "No hay marcas eliminadas." : "Registra la primera marca para comenzar."}
            actionLabel={!isPapeleraMode ? "Nueva Marca" : undefined}
            onAction={!isPapeleraMode ? () => handleOpenModal() : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto w-full rounded-lg">
              <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Descripción</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMarcas.map((marca) => (
                    <tr key={marca.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{marca.nombre}</td>
                      <td className="py-3 px-4">{marca.descripcion}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isPapeleraMode ? (
                            <>
                              <Button variant="secondary" onClick={() => handleOpenModal(marca)}>Editar</Button>
                              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(marca)}>Eliminar</Button>
                              <Button variant="primary" onClick={() => navigate(`/productos?marca_id=${marca.id}`)}>Ver Productos</Button>
                            </>
                          ) : (
                            <>
                              <Button variant="secondary" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(marca.id)}>Recuperar</Button>
                              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(marca)}>Elim. Definitivo</Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden flex flex-col gap-4">
              {filteredMarcas.map((marca) => (
                <div key={marca.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{marca.nombre}</h3>
                    {marca.descripcion && <p className="text-sm text-gray-500 mt-1">{marca.descripcion}</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    {!isPapeleraMode ? (
                      <>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5" onClick={() => handleOpenModal(marca)}>Editar</Button>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(marca)}>Eliminar</Button>
                        <Button variant="primary" className="w-full justify-center text-sm py-1.5" onClick={() => navigate(`/productos?marca_id=${marca.id}`)}>Ver Productos</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(marca.id)}>Recuperar</Button>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(marca)}>Elim. Definitivo</Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingMarca ? 'Editar Marca' : 'Nueva Marca'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {errorModal && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {errorModal}
                </div>
              )}
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              <Input
                label="Descripción"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              />
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} className="min-w-[100px]">
                {saving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando</span>
                  </div>
                ) : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Recovery Modal Component */}
      {RecoveryComponent}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
        onConfirm={async () => {
          if (isPapeleraMode) {
            await marcaService.delete(itemToDelete.id)
            toast.success('Marca eliminada permanentemente')
          } else {
            await marcaService.desactivar(itemToDelete.id)
            toast.success('Marca enviada a la papelera')
          }
          loadMarcas()
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        title={isPapeleraMode ? 'Eliminar Permanentemente' : 'Eliminar Marca'}
        message={`¿Está seguro de ${isPapeleraMode ? 'eliminar permanentemente' : 'eliminar'} la marca "${itemToDelete?.nombre}"?`}
        confirmText={isPapeleraMode ? 'Eliminar Definitivamente' : 'Enviar a Papelera'}
        variant="danger"
        dependencyConfig={{
          service: marcaService,
          itemId: itemToDelete?.id,
          isPhysicalDelete: isPapeleraMode
        }}
      />

      {showImportModal && (
        <GenericImportarModal 
          title="Importación de Marcas"
          description="Añade múltiples marcas usando un archivo Excel"
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadMarcas()
          }}
          descargarPlantillaFn={marcaService.descargarPlantilla}
          importarPreviaFn={marcaService.importarPrevia}
          importarConfirmarFn={marcaService.importarConfirmar}
        />
      )}
    </div>
  )
}
