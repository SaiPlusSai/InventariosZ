import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input, ConfirmModal, EmptyState } from '../../components/ui'
import CrudToolbar from '../../components/ui/Crud/CrudToolbar'
import { useColorStore } from '../../store/colorStore'
import { colorService } from '../../services/colorService'
import { getHexFromColorName } from '../../utils/colorDictionary'
import { useRecoveryManager } from '../../hooks/useRecoveryManager'
import toast from 'react-hot-toast'
import { Trash2, Upload, Download, FileText, RotateCcw, Plus, Loader2 , FileDown, FileUp} from 'lucide-react'
import GenericImportarModal from '../../components/ui/GenericImportarModal'

export default function Colores() {
  const navigate = useNavigate()
  const { colores, setColores, loading, setLoading, error, setError } = useColorStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingColor, setEditingColor] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', codigo_hex: '' })
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const [isPapeleraMode, setIsPapeleraMode] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [errorModal, setErrorModal] = useState(null)

  const { handleRecoveryError, RecoveryComponent } = useRecoveryManager(colorService, () => {
    handleCloseModal()
    loadColores()
  })

  const loadColores = async (papelera = isPapeleraMode) => {
    try {
      setLoading(true)
      const res = papelera ? await colorService.getPapelera() : await colorService.getAll()
      setColores(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los colores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadColores(isPapeleraMode)
  }, [isPapeleraMode])

  const handleOpenModal = (color = null) => {
    if (color) {
      setEditingColor(color)
      setFormData({ nombre: color.nombre, codigo_hex: color.codigo_hex || '' })
    } else {
      setEditingColor(null)
      setFormData({ nombre: '', codigo_hex: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingColor(null)
    setFormData({ nombre: '', codigo_hex: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingColor) {
        await colorService.update(editingColor.id, formData)
        toast.success('Registro actualizado correctamente')
      } else {
        await colorService.create(formData)
        toast.success('Registro creado correctamente')
      }
      handleCloseModal()
      loadColores()
    } catch (err) {
      if (!handleRecoveryError(err, formData.nombre)) {
        setErrorModal(err.customMessage || 'Error al guardar el color')
      }
    } finally {
      setSaving(false)
    }
  }


  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...')
      const response = await colorService.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'colores_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar a Excel')
    }
  }

  const handleDeleteClick = (color) => {
    setItemToDelete(color)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await colorService.recuperar(id)
      toast.success('Registro recuperado correctamente')
      loadColores()
    } catch (err) {
      console.error(err)
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          'Error al recuperar el color'
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

  const filteredColores = colores.filter(color => 
    color.nombre.toLowerCase().includes(appliedSearch.toLowerCase()) || 
    (color.codigo_hex && color.codigo_hex.toLowerCase().includes(appliedSearch.toLowerCase()))
  )

  return (
    <div>
      <CrudToolbar
        title={isPapeleraMode ? 'Colores (Papelera)' : 'Colores'}
        description={isPapeleraMode ? 'Colores inactivos' : 'Gestiona los colores disponibles.'}
        primaryActions={[
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
              label: "Nuevo Color",
              icon: Plus,
              variant: "primary",
              className: "shadow-md shadow-primary-500/20",
              onClick: () => handleOpenModal()
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
            label: "Exportar Excel",
            icon: FileUp,
            title: "Exportar a Excel",
            onClick: handleExportarExcel
          }
        ] : []}
        searchConfig={{
          placeholder: "Buscar...",
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
        ) : colores.length === 0 ? (
          <EmptyState 
            title={isPapeleraMode ? "Papelera vacía" : "No hay registros"}
            description={isPapeleraMode ? "No hay registros eliminados." : "Crea el primer registro para comenzar."}
            actionLabel={!isPapeleraMode ? "Nuevo Registro" : undefined}
            onAction={!isPapeleraMode ? () => handleOpenModal() : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto w-full rounded-lg">
              <table className="w-full text-left border-collapse min-w-[600px] whitespace-nowrap">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Código Hex</th>
                    <th className="py-3 px-4 font-semibold text-gray-700">Muestra</th>
                    <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredColores.map((color) => (
                    <tr key={color.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{color.nombre}</td>
                      <td className="py-3 px-4">{color.codigo_hex}</td>
                      <td className="py-3 px-4">
                        {color.codigo_hex && (
                          <div className="w-6 h-6 rounded border" style={{ backgroundColor: color.codigo_hex }}></div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isPapeleraMode ? (
                            <>
                              <Button variant="secondary" onClick={() => handleOpenModal(color)}>Editar</Button>
                              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(color)}>Eliminar</Button>
                              <Button variant="primary" onClick={() => navigate(`/productos?color_id=${color.id}`)}>Ver Productos</Button>
                            </>
                          ) : (
                            <>
                              <Button variant="secondary" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(color.id)}>Recuperar</Button>
                              <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(color)}>Elim. Definitivo</Button>
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
              {filteredColores.map((color) => (
                <div key={color.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {color.codigo_hex && (
                      <div className="w-8 h-8 rounded-full border shadow-inner flex-shrink-0" style={{ backgroundColor: color.codigo_hex }}></div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{color.nombre}</h3>
                      {color.codigo_hex && <p className="text-sm text-gray-500">{color.codigo_hex}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    {!isPapeleraMode ? (
                      <>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5" onClick={() => handleOpenModal(color)}>Editar</Button>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(color)}>Eliminar</Button>
                        <Button variant="primary" className="w-full justify-center text-sm py-1.5" onClick={() => navigate(`/productos?color_id=${color.id}`)}>Ver Productos</Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5 text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleRecuperar(color.id)}>Recuperar</Button>
                        <Button variant="secondary" className="w-full justify-center text-sm py-1.5 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteClick(color)}>Elim. Definitivo</Button>
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
              <h2 className="text-xl font-bold">{editingColor ? 'Editar Color' : 'Nuevo Color'}</h2>
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
                onChange={(e) => {
                  const val = e.target.value
                  const hex = getHexFromColorName(val)
                  setFormData({ 
                    ...formData, 
                    nombre: val,
                    codigo_hex: hex ? hex : formData.codigo_hex
                  })
                }}
                autoFocus
              />
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Input
                    label="Código Hex"
                    value={formData.codigo_hex}
                    onChange={(e) => setFormData({ ...formData, codigo_hex: e.target.value })}
                  />
                </div>
                <div className="mb-1 flex items-center justify-center">
                  <input 
                    type="color" 
                    value={formData.codigo_hex || '#000000'} 
                    onChange={(e) => setFormData({ ...formData, codigo_hex: e.target.value })}
                    className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                  />
                </div>
              </div>
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
            await colorService.delete(itemToDelete.id)
            toast.success('Registro eliminado permanentemente')
          } else {
            await colorService.desactivar(itemToDelete.id)
            toast.success('Registro enviado a la papelera')
          }
          loadColores()
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}
        title={isPapeleraMode ? 'Eliminar Permanentemente' : 'Eliminar Registro'}
        message={`¿Está seguro de ${isPapeleraMode ? 'eliminar permanentemente' : 'eliminar'} el registro "${itemToDelete?.nombre || itemToDelete?.codigo}"?`}
        confirmText={isPapeleraMode ? 'Eliminar Definitivamente' : 'Enviar a Papelera'}
        variant="danger"
        dependencyConfig={{
          service: colorService,
          itemId: itemToDelete?.id,
          isPhysicalDelete: isPapeleraMode
        }}
      />

      {showImportModal && (
        <GenericImportarModal 
          title="Importación de Colores"
          description="Añade múltiples registros usando un archivo Excel"
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadColores()
          }}
          descargarPlantillaFn={colorService.descargarPlantilla}
          importarPreviaFn={colorService.importarPrevia}
          importarConfirmarFn={colorService.importarConfirmar}
        />
      )}
    </div>
  )
}
