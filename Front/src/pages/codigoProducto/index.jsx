import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Input } from '../../components/ui'
import { useCodigoProductoStore } from '../../store/codigoProductoStore'
import { codigoProductoService } from '../../services/codigoProductoService'
import { marcaService } from '../../services/marcaService'

export default function CodigoProducto() {
  const navigate = useNavigate()
  const { codigos, setCodigos, loading, setLoading, error, setError } = useCodigoProductoStore()
  
  const [marcas, setMarcas] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCodigo, setEditingCodigo] = useState(null)
  
  const [formData, setFormData] = useState({ marca_id: '', codigo: '' })
  const [saving, setSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  const loadData = async () => {
    try {
      setLoading(true)
      const [resCodigos, resMarcas] = await Promise.all([
        codigoProductoService.getAll(),
        marcaService.getAll()
      ])
      setCodigos(resCodigos.data)
      setMarcas(resMarcas.data)
    } catch (err) {
      console.error(err)
      setError('Error al cargar los códigos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenModal = (codigo = null) => {
    if (codigo) {
      setEditingCodigo(codigo)
      setFormData({ marca_id: codigo.marca_id, codigo: codigo.codigo || '' })
    } else {
      setEditingCodigo(null)
      setFormData({ marca_id: '', codigo: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingCodigo(null)
    setFormData({ marca_id: '', codigo: '' })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        marca_id: parseInt(formData.marca_id, 10),
        codigo: formData.codigo
      }
      if (editingCodigo) {
        await codigoProductoService.update(editingCodigo.id, payload)
      } else {
        await codigoProductoService.create(payload)
      }
      handleCloseModal()
      loadData()
    } catch (err) {
      console.error(err)
      alert('Error al guardar el código de producto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este código?')) {
      try {
        await codigoProductoService.delete(id)
        loadData()
      } catch (err) {
        console.error(err)
        alert('Error al eliminar el código')
      }
    }
  }

  const handleSearch = () => {
    setAppliedSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    setAppliedSearch('')
  }

  const filteredCodigos = codigos.filter(item => {
    const term = appliedSearch.toLowerCase()
    const marca = marcas.find(m => m.id === item.marca_id)
    const marcaNombre = marca ? marca.nombre.toLowerCase() : ''
    return item.codigo.toLowerCase().includes(term) || marcaNombre.includes(term)
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Códigos de Producto</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Nuevo Código
        </Button>
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
        ) : codigos.length === 0 ? (
          <p className="text-gray-500">No hay códigos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-4 font-semibold text-gray-700">Código</th>
                  <th className="py-3 px-4 font-semibold text-gray-700">Marca</th>
                  <th className="py-3 px-4 font-semibold text-gray-700 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodigos.map((item) => {
                  const marca = marcas.find((m) => m.id === item.marca_id)
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{item.codigo}</td>
                      <td className="py-3 px-4">{marca ? marca.nombre : item.marca_id}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" onClick={() => handleOpenModal(item)}>Editar</Button>
                          <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(item.id)}>Eliminar</Button>
                          <Button variant="primary" onClick={() => navigate(`/productos?codigo=${item.codigo}`)}>Ver Variantes</Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col">
            <div className="border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCodigo ? 'Editar Código' : 'Nuevo Código'}</h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <Input
                label="Código"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  value={formData.marca_id}
                  onChange={(e) => setFormData({ ...formData, marca_id: e.target.value })}
                >
                  <option value="">Seleccione una marca...</option>
                  {marcas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleCloseModal} disabled={saving}>Cancelar</Button>
              <Button variant="primary" onClick={handleSave} disabled={saving || !formData.marca_id || !formData.codigo}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
