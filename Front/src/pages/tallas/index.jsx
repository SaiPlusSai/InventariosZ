import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useTallaStore } from '../../store/tallaStore'
import { tallaService } from '../../services/tallaService'

export default function Tallas() {
  const navigate = useNavigate()
  const { tallas, setTallas, loading, setLoading, error, setError } = useTallaStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingTalla, setEditingTalla] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', orden: 0 })
  const [saving, setSaving] = useState(false)

  const loadTallas = async () => {
    try {
      setLoading(true)
      const res = await tallaService.getAll()
      setTallas(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar las tallas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTallas()
  }, [])

  const handleOpenModal = (talla = null) => {
    if (talla) {
      setEditingTalla(talla)
      setFormData({ nombre: talla.nombre, orden: talla.orden || 0 })
    } else {
      setEditingTalla(null)
      setFormData({ nombre: '', orden: 0 })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTalla(null)
    setFormData({ nombre: '', orden: 0 })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        nombre: formData.nombre,
        orden: parseInt(formData.orden, 10) || 0
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

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta talla?')) {
      try {
        await tallaService.delete(id)
        loadTallas()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar la talla')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tallas</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nueva Talla
        </Button>
      </div>

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
                  <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Orden</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tallas.map((talla) => (
                  <tr key={talla.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{talla.nombre}</td>
                    <td className="py-3 px-4">{talla.orden}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => handleOpenModal(talla)}>Editar</Button>
                        <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(talla.id)}>Eliminar</Button>
                        <Button variant="primary" onClick={() => navigate(`/productos?talla_id=${talla.id}`)}>Ver Productos</Button>
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
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              <Input
                label="Orden (Número)"
                type="number"
                value={formData.orden}
                onChange={(e) => setFormData({ ...formData, orden: e.target.value })}
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
