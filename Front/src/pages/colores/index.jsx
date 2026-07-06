import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useColorStore } from '../../store/colorStore'
import { colorService } from '../../services/colorService'

export default function Colores() {
  const navigate = useNavigate()
  const { colores, setColores, loading, setLoading, error, setError } = useColorStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingColor, setEditingColor] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', codigo_hex: '' })
  const [saving, setSaving] = useState(false)

  const loadColores = async () => {
    try {
      setLoading(true)
      const res = await colorService.getAll()
      setColores(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los colores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadColores()
  }, [])

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
      console.error(err)
      alert('Error al guardar el color')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este color?')) {
      try {
        await colorService.delete(id)
        loadColores()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar el color')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Colores</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nuevo Color
        </Button>
      </div>

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
                {colores.map((color) => (
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
                        <Button variant="secondary" onClick={() => handleOpenModal(color)}>Editar</Button>
                        <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(color.id)}>Eliminar</Button>
                        <Button variant="primary" onClick={() => navigate(`/productos?color_id=${color.id}`)}>Ver Productos</Button>
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
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
              <Input
                label="Código Hex (ej. #FF0000)"
                value={formData.codigo_hex}
                onChange={(e) => setFormData({ ...formData, codigo_hex: e.target.value })}
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
