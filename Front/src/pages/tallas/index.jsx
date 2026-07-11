import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { ConfirmModal, EmptyState } from '../../components/ui'
import { useTallaStore } from '../../store/tallaStore'
import { tallaService } from '../../services/tallaService'
import { useRecoveryManager } from '../../hooks/useRecoveryManager'
import toast from 'react-hot-toast'
import { Trash2, Upload, Download, FileText, RotateCcw, Plus, Loader2 , FileDown, FileUp} from 'lucide-react'
import GenericImportarModal from '../../components/ui/GenericImportarModal'

export default function Tallas() {
  const navigate = useNavigate()
  const { tallas, setTallas, loading, setLoading, error, setError } = useTallaStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingTalla, setEditingTalla] = useState(null)
  
  const [formData, setFormData] = useState({ numero: '' })
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [errorModal, setErrorModal] = useState(null)

  const { handleRecoveryError, RecoveryComponent } = useRecoveryManager(tallaService, () => {
    handleCloseModal()
    loadTallas()
  })

  const loadTallas = async (papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      const res = papelera ? await tallaService.getPapelera() : await tallaService.getAll()
      setTallas(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las tallas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTallas(isPapeleraMode)
  }, [isPapeleraMode])

  const handleOpenModal = (talla = null) => {
    if (talla) {
      setEditingTalla(talla)
      setFormData({ numero: talla.nombre || '' })
    } else {
      setEditingTalla(null)
      setFormData({ numero: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTalla(null)
    setFormData({ numero: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const parsedNum = parseInt(formData.numero, 10) || 0
      const payload = {
        nombre: formData.numero,
        orden: parsedNum
      }
      if (editingTalla) {
        await tallaService.update(editingTalla.id, payload)
        toast.success('Registro actualizado correctamente')
      } else {
        await tallaService.create(payload)
        toast.success('Registro creado correctamente')
      }
      handleCloseModal()
      loadTallas()
    } catch (err) {
      if (!handleRecoveryError(err, formData.numero)) {
        setErrorModal(err.customMessage || 'Error al guardar la talla')
      }
    } finally {
      setSaving(false)
    }
  }


  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...')
      const response = await tallaService.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'tallas_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar a Excel')
    }
  }

  const handleDeleteClick = (talla) => {
    setItemToDelete(talla)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await tallaService.recuperar(id)
      toast.success('Registro recuperado correctamente')
      loadTallas()
    } catch (err) {
      console.error(err)
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          'Error al recuperar la talla'
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

  const filteredTallas = tallas.filter(talla => 
    talla.nombre.toLowerCase().includes(appliedSearch.toLowerCase()))

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {isPapeleraMode ? 'Tallas (Papelera)' : 'Tallas'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isPapeleraMode ? 'Tallas inactivas' : 'Gestiona las tallas disponibles.'}
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
                <FileDown size={16} className="mr-2 inline"/> Importar
              </Button>
              <Button variant="secondary" onClick={handleExportarExcel} className="flex-1 md:flex-none" title="Exportar a Excel">
                <FileUp size={16} className="mr-2 inline"/> Exportar
              </Button>
              <Button variant="primary" onClick={() => handleOpenModal()} className="flex-1 md:flex-none shadow-md shadow-primary-500/20">
                <Plus size={16} className="mr-2 inline"/> Nueva Talla
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
        ) : tallas.length === 0 ? (
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
                  <th className="py-3 px-4 font-semibold text-gray-700">Número</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTallas.map((talla) => (
                  <tr key={talla.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{talla.nombre}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!isPapeleraMode ? (
                          <>
                            <Button variant="secondary" onClick={() => handleOpenModal(talla)}>Editar</Button>
                            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(talla)}>Eliminar</Button>
                            <Button variant="primary" onClick={() => navigate(`/productos?talla_id=${talla.id}`)}>Ver Productos</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="secondary" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(talla.id)}>Recuperar</Button>
                            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(talla)}>Elim. Definitivo</Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingTalla ? 'Editar Talla' : 'Nueva Talla'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {errorModal && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {errorModal}
                </div>
              )}
              <Input
                label="Número de Talla"
                value={formData.numero}
                onChange={(e) => setFormData({ numero: e.target.value })}
                placeholder="Ej. 38, 40, S, M, L..."
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
            await tallaService.delete(itemToDelete.id)
            toast.success('Registro eliminado permanentemente')
          } else {
            await tallaService.desactivar(itemToDelete.id)
            toast.success('Registro enviado a la papelera')
          }
          loadTallas()
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        title={isPapeleraMode ? 'Eliminar Permanentemente' : 'Eliminar Registro'}
        message={`¿Está seguro de ${isPapeleraMode ? 'eliminar permanentemente' : 'eliminar'} el registro "${itemToDelete?.nombre || itemToDelete?.codigo}"?`}
        confirmText={isPapeleraMode ? 'Eliminar Definitivamente' : 'Enviar a Papelera'}
        variant="danger"
        dependencyConfig={{
          service: tallaService,
          itemId: itemToDelete?.id,
          isPhysicalDelete: isPapeleraMode
        }}
      />

      {showImportModal && (
        <GenericImportarModal 
          title="Importación de Tallas"
          description="Añade múltiples registros usando un archivo Excel"
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadTallas()
          }}
          descargarPlantillaFn={tallaService.descargarPlantilla}
          importarPreviaFn={tallaService.importarPrevia}
          importarConfirmarFn={tallaService.importarConfirmar}
        />
      )}
    </div>
  )
}
