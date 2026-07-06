import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal'
import { useTallaStore } from '../../store/tallaStore'
import { tallaService } from '../../services/tallaService'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

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
      } else {
        await tallaService.create(payload)
      }
      handleCloseModal()
      loadTallas()
    } catch (err) {
      console.error(err)
      alert('Error al guardar la talla')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (talla) => {
    setItemToDelete(talla)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await tallaService.recuperar(id)
      loadTallas()
    } catch (err) {
      console.error(err)
      alert('Error al recuperar la talla')
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
    talla.nombre.toLowerCase().includes(appliedSearch.toLowerCase())
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{isPapeleraMode ? 'Tallas (Papelera)' : 'Tallas'}</h1>
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
              + Nueva Talla
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
        ) : tallas.length === 0 ? (
          <p className="text-gray-500">No hay tallas registradas</p>
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
              <Input
                label="Número"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setItemToDelete(null); }}
        onConfirm={() => loadTallas()}
        service={tallaService}
        item={itemToDelete}
        isPhysicalDelete={isPapeleraMode}
      />
    </div>
  )
}
