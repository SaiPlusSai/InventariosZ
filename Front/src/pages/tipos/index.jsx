import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { ConfirmModal, EmptyState } from '../../components/ui'
import { useTipoCalzadoStore } from '../../store/tipoCalzadoStore'
import { tipoCalzadoService } from '../../services/tipoCalzadoService'
import { useRecoveryManager } from '../../hooks/useRecoveryManager'
import toast from 'react-hot-toast'
import { Loader2, Download, Upload } from 'lucide-react'
import GenericImportarModal from '../../components/ui/GenericImportarModal'

export default function Tipos() {
  const navigate = useNavigate()
  const { tipos, setTipos, loading, setLoading, error, setError } = useTipoCalzadoStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingTipo, setEditingTipo] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [errorModal, setErrorModal] = useState(null)

  const { handleRecoveryError, RecoveryComponent } = useRecoveryManager(tipoCalzadoService, () => {
    handleCloseModal()
    loadTipos()
  })

  const loadTipos = async (papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      const res = papelera ? await tipoCalzadoService.getPapelera() : await tipoCalzadoService.getAll()
      setTipos(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los tipos de calzado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTipos(isPapeleraMode)
  }, [isPapeleraMode])

  const handleOpenModal = (tipo = null) => {
    if (tipo) {
      setEditingTipo(tipo)
      setFormData({ nombre: tipo.nombre, descripcion: tipo.descripcion || '' })
    } else {
      setEditingTipo(null)
      setFormData({ nombre: '', descripcion: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTipo(null)
    setFormData({ nombre: '', descripcion: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingTipo) {
        await tipoCalzadoService.update(editingTipo.id, formData)
        toast.success('Registro actualizado correctamente')
      } else {
        await tipoCalzadoService.create(formData)
        toast.success('Registro creado correctamente')
      }
      handleCloseModal()
      loadTipos()
    } catch (err) {
      if (!handleRecoveryError(err, formData.nombre)) {
        setErrorModal(err.customMessage || 'Error al guardar el tipo de calzado')
      }
    } finally {
      setSaving(false)
    }
  }


  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...')
      const response = await tipoCalzadoService.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'tipos_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar a Excel')
    }
  }

  const handleDeleteClick = (tipo) => {
    setItemToDelete(tipo)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await tipoCalzadoService.recuperar(id)
      toast.success('Registro recuperado correctamente')
      loadTipos()
    } catch (err) {
      console.error(err)
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          'Error al recuperar el tipo de calzado'
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

  const filteredTipos = tipos.filter(tipo => 
    tipo.nombre.toLowerCase().includes(appliedSearch.toLowerCase()) || 
    (tipo.descripcion && tipo.descripcion.toLowerCase().includes(appliedSearch.toLowerCase()))
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isPapeleraMode ? 'Tipos de Calzado (Papelera)' : 'Tipos de Calzado'}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setIsPapeleraMode(!isPapeleraMode)
            setSearchTerm('')
            setAppliedSearch('')
          }}>
            {isPapeleraMode ? 'Volver a Activos' : 'Ver Papelera'}
          </Button>
          {!isPapeleraMode && (
            <>
              <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                <Upload size={16} className="mr-2 inline" /> Importar
              </Button>
              <Button variant="secondary" onClick={handleExportarExcel}>
                <Download size={16} className="mr-2 inline" /> Exportar
              </Button>
              <Button variant="primary" onClick={() => handleOpenModal()}>
              + Nuevo Tipo
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
        ) : tipos.length === 0 ? (
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
                  <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Descripción</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredTipos.map((tipo) => (
                  <tr key={tipo.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{tipo.nombre}</td>
                    <td className="py-3 px-4">{tipo.descripcion}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!isPapeleraMode ? (
                          <>
                            <Button variant="secondary" onClick={() => handleOpenModal(tipo)}>Editar</Button>
                            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(tipo)}>Eliminar</Button>
                            <Button variant="primary" onClick={() => navigate(`/productos?tipo_calzado_id=${tipo.id}`)}>Ver Productos</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="secondary" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(tipo.id)}>Recuperar</Button>
                            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(tipo)}>Elim. Definitivo</Button>
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
              <h2 className="text-xl font-bold">{editingTipo ? 'Editar Tipo' : 'Nuevo Tipo'}</h2>
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
      )}{/* Reusable Recovery Modal Component */}
      {RecoveryComponent}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
        onConfirm={async () => {
          if (isPapeleraMode) {
            await tipoCalzadoService.delete(itemToDelete.id)
            toast.success('Registro eliminado permanentemente')
          } else {
            await tipoCalzadoService.desactivar(itemToDelete.id)
            toast.success('Registro enviado a la papelera')
          }
          loadTipos()
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        title={isPapeleraMode ? 'Eliminar Permanentemente' : 'Eliminar Registro'}
        message={`¿Está seguro de ${isPapeleraMode ? 'eliminar permanentemente' : 'eliminar'} el registro "${itemToDelete?.nombre || itemToDelete?.codigo}"?`}
        confirmText={isPapeleraMode ? 'Eliminar Definitivamente' : 'Enviar a Papelera'}
        variant="danger"
        dependencyConfig={{
          service: tipoCalzadoService,
          itemId: itemToDelete?.id,
          isPhysicalDelete: isPapeleraMode
        }}
      />

      {showImportModal && (
        <GenericImportarModal 
          title="Importación de Tipos"
          description="Añade múltiples registros usando un archivo Excel"
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadTipos()
          }}
          descargarPlantillaFn={tipoCalzadoService.descargarPlantilla}
          importarPreviaFn={tipoCalzadoService.importarPrevia}
          importarConfirmarFn={tipoCalzadoService.importarConfirmar}
        />
      )}
    </div>
  )
}
