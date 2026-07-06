import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useMaterialStore } from '../../store/materialStore'
import { materialService } from '../../services/materialService'

export default function Materiales() {
  const navigate = useNavigate()
  const { materiales, setMateriales, loading, setLoading, error, setError } = useMaterialStore()
  
  const [showModal, setShowModal] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' })
  const [saving, setSaving] = useState(false)

  const loadMateriales = async () => {
    try {
      setLoading(true)
      const res = await materialService.getAll()
      setMateriales(res.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los materiales')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMateriales()
  }, [])

  const handleOpenModal = (material = null) => {
    if (material) {
      setEditingMaterial(material)
      setFormData({ nombre: material.nombre, descripcion: material.descripcion || '' })
    } else {
      setEditingMaterial(null)
      setFormData({ nombre: '', descripcion: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMaterial(null)
    setFormData({ nombre: '', descripcion: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      if (editingMaterial) {
        await materialService.update(editingMaterial.id, formData)
      } else {
        await materialService.create(formData)
      }
      handleCloseModal()
      loadMateriales()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el material')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este material?')) {
      try {
        await materialService.delete(id)
        loadMateriales()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar el material')
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Materiales</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nuevo Material
        </Button>
      </div>

      <Card>
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : materiales.length === 0 ? (
          <p className="text-gray-500">No hay materiales registrados</p>
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
                {materiales.map((material) => (
                  <tr key={material.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{material.nombre}</td>
                    <td className="py-3 px-4">{material.descripcion}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => handleOpenModal(material)}>Editar</Button>
                        <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(material.id)}>Eliminar</Button>
                        <Button variant="primary" onClick={() => navigate(`/productos?material_id=${material.id}`)}>Ver Productos</Button>
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
              <h2 className="text-xl font-bold">{editingMaterial ? 'Editar Material' : 'Nuevo Material'}</h2>
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
