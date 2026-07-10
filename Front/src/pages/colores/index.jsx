import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal'
import { useColorStore } from '../../store/colorStore'
import { colorService } from '../../services/colorService'
import { getHexFromColorName } from '../../utils/colorDictionary'
import { useRecoveryManager } from '../../hooks/useRecoveryManager'

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
      } else {
        await colorService.create(formData)
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

  const handleDeleteClick = (color) => {
    setItemToDelete(color)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await colorService.recuperar(id)
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isPapeleraMode ? 'Colores (Papelera)' : 'Colores'}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setIsPapeleraMode(!isPapeleraMode)
            setSearchTerm('')
            setAppliedSearch('')
          }}>
            {isPapeleraMode ? 'Volver a Activos' : 'Ver Papelera'}
          </Button>
          {!isPapeleraMode && (
            <Button variant="primary" onClick={() => handleOpenModal()}>
              + Nuevo Color
            </Button>
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
        ) : colores.length === 0 ? (
          <p className="text-gray-500">No hay colores registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
              <Button variant="primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reusable Recovery Modal Component */}
      {RecoveryComponent}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
        onConfirm={() => loadColores()}
        service={colorService}
        item={itemToDelete}
        isPhysicalDelete={isPapeleraMode}
      />
    </div>
  )
}
