import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useTipoCalzadoStore } from '../../store/tipoCalzadoStore'
import { tipoCalzadoService } from '../../services/tipoCalzadoService'

export default function Tipos() {
  const navigate = useNavigate()
  const { tiposCalzado, setTiposCalzado, loading, setLoading, error, setError } = useTipoCalzadoStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingTipo, setEditingTipo] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  const loadTipos = async () => {
    try {
      setLoading(true)
      const res = await tipoCalzadoService.getAll()
      setTiposCalzado(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los tipos de calzado')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTipos()
  }, [])

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

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este tipo de calzado?')) {
      try {
        await tipoCalzadoService.delete(id)
        loadTipos()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar el tipo de calzado')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tipos de Calzado</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nuevo Tipo
        </Button>
      </div>

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
                {tiposCalzado.map((tipo) => (
                  <tr key={tipo.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{tipo.nombre}</td>
                    <td className="py-3 px-4">{tipo.descripcion}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => handleOpenModal(tipo)}>Editar</Button>
                        <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(tipo.id)}>Eliminar</Button>
                        <Button variant="primary" onClick={() => navigate(`/productos?tipo_calzado_id=${tipo.id}`)}>Ver Productos</Button>
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
    </div>
  )
}
