import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import DeleteConfirmationModal from '../../components/ui/DeleteConfirmationModal'
import { useTipoCalzadoStore } from '../../store/tipoCalzadoStore'
import { tipoCalzadoService } from '../../services/tipoCalzadoService'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

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
      } else {
        await tipoCalzadoService.create(formData)
      }
      handleCloseModal()
      loadTipos()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el tipo de calzado')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteClick = (tipo) => {
    setItemToDelete(tipo)
    setShowDeleteModal(true)
  }

  const handleRecuperar = async (id) => {
    try {
      await tipoCalzadoService.recuperar(id)
      loadTipos()
    } catch (err) {
      console.error(err)
      alert('Error al recuperar el tipo de calzado')
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
            <Button variant="primary" onClick={() => handleOpenModal()}>
              + Nuevo Tipo
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
        ) : tiposCalzado.length === 0 ? (
          <p className="text-gray-500">No hay tipos registrados</p>
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
              <h2 className="text-xl font-bold">{editingTipo ? 'Editar Tipo de Calzado' : 'Nuevo Tipo de Calzado'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
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
        onConfirm={() => loadTipos()}
        service={tipoCalzadoService}
        item={itemToDelete}
        isPhysicalDelete={isPapeleraMode}
      />
    </div>
  )
}
