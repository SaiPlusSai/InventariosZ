import { useEffect, useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useMarcaStore } from '../../../store/marcaStore'
import { useTipoCalzadoStore } from '../../../store/tipoCalzadoStore'
import { useMaterialStore } from '../../../store/materialStore'
import { marcaService } from '../../../services/marcaService'
import { tipoCalzadoService } from '../../../services/tipoCalzadoService'
import { materialService } from '../../../services/materialService'
import { codigoProductoService } from '../../../services/codigoProductoService'
import { Input, Button, FastCreateModal } from '../../../components/ui'
import { Plus } from 'lucide-react'

export default function Step1InformacionGeneral() {
  const { formData, setFormData } = useWizardStore()
  const { marcas, setMarcas } = useMarcaStore()
  const { tipos, setTipos } = useTipoCalzadoStore()
  const { materiales, setMateriales } = useMaterialStore()
  const [codigos, setCodigos] = useState([])
  const [loading, setLoading] = useState(true)

  const [fastCreate, setFastCreate] = useState({ isOpen: false, type: null })

  const handleFastCreateSuccess = (newElement, type) => {
    if (type === 'marca') {
      setMarcas([...marcas, newElement])
      setFormData({ ...formData, marca_id: newElement.id })
    } else if (type === 'tipo') {
      setTipos([...tipos, newElement])
      setFormData({ ...formData, tipo_calzado_id: newElement.id })
    } else if (type === 'material') {
      setMateriales([...materiales, newElement])
      setFormData({ ...formData, material_id: newElement.id })
    } else if (type === 'codigo') {
      setCodigos([...codigos, newElement])
      setFormData({ ...formData, codigo: newElement.codigo, marca_id: newElement.marca_id })
    }
    setFastCreate({ isOpen: false, type: null })
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [marcasRes, tiposRes, materialesRes, codigosRes] = await Promise.all([
          marcaService.getAll(),
          tipoCalzadoService.getAll(),
          materialService.getAll(),
          codigoProductoService.getAll(),
        ])
        setMarcas(marcasRes.data.data || marcasRes.data)
        setTipos(tiposRes.data.data || tiposRes.data)
        setMateriales(materialesRes.data.data || materialesRes.data)
        setCodigos(codigosRes.data.data || codigosRes.data)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    // Si el campo es un ID (termina en _id), lo convertimos a entero si no esta vacio.
    // Si es un campo de texto (codigo, descripcion), lo mantenemos como string.
    let parsedValue = value
    if (name.endsWith('_id')) {
      parsedValue = value === '' ? null : parseInt(value)
    }

    if (name === 'codigo') {
      const selectedCodigo = codigos.find((c) => c.codigo === value)
      if (selectedCodigo) {
        setFormData({
          ...formData,
          codigo: value,
          marca_id: selectedCodigo.marca_id
        })
        return
      }
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue,
    })
  }

  if (loading) {
    return <div className="text-center text-gray-600">Cargando...</div>
  }

  return (
    <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Código del Producto *
          </label>
          <div className="flex gap-2">
            <select
              name="codigo"
              value={formData.codigo || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona un código</option>
              {codigos.map((c) => (
                <option key={c.id} value={c.codigo}>
                  {c.codigo}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => setFastCreate({ isOpen: true, type: 'codigo' })} className="px-3">
              <Plus size={20} />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca *
          </label>
          <div className="flex gap-2">
            <select
              name="marca_id"
              value={formData.marca_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona una marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>
                  {marca.nombre}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => setFastCreate({ isOpen: true, type: 'marca' })} className="px-3">
              <Plus size={20} />
            </Button>
          </div>
        </div>

      <Input
        label="Descripción"
        name="descripcion"
        value={formData.descripcion}
        onChange={handleChange}
        placeholder="Descripción del producto"
        required
      />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Calzado *
          </label>
          <div className="flex gap-2">
            <select
              name="tipo_calzado_id"
              value={formData.tipo_calzado_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona un tipo</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => setFastCreate({ isOpen: true, type: 'tipo' })} className="px-3">
              <Plus size={20} />
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material *
          </label>
          <div className="flex gap-2">
            <select
              name="material_id"
              value={formData.material_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona un material</option>
              {materiales.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.nombre}
                </option>
              ))}
            </select>
            <Button type="button" variant="secondary" onClick={() => setFastCreate({ isOpen: true, type: 'material' })} className="px-3">
              <Plus size={20} />
            </Button>
          </div>
        </div>

      {fastCreate.isOpen && fastCreate.type === 'marca' && (
        <FastCreateModal
          isOpen={true}
          onClose={() => setFastCreate({ isOpen: false, type: null })}
          title="Nueva Marca"
          inputLabel="Nombre de la marca"
          apiService={marcaService}
          onSuccess={(el) => handleFastCreateSuccess(el, 'marca')}
          hasDescription={true}
        />
      )}
      {fastCreate.isOpen && fastCreate.type === 'tipo' && (
        <FastCreateModal
          isOpen={true}
          onClose={() => setFastCreate({ isOpen: false, type: null })}
          title="Nuevo Tipo de Calzado"
          inputLabel="Nombre del tipo"
          apiService={tipoCalzadoService}
          onSuccess={(el) => handleFastCreateSuccess(el, 'tipo')}
          hasDescription={true}
        />
      )}
      {fastCreate.isOpen && fastCreate.type === 'material' && (
        <FastCreateModal
          isOpen={true}
          onClose={() => setFastCreate({ isOpen: false, type: null })}
          title="Nuevo Material"
          inputLabel="Nombre del material"
          apiService={materialService}
          onSuccess={(el) => handleFastCreateSuccess(el, 'material')}
          hasDescription={true}
        />
      )}
      {fastCreate.isOpen && fastCreate.type === 'codigo' && (
        <FastCreateCodigoModal
          isOpen={true}
          onClose={() => setFastCreate({ isOpen: false, type: null })}
          onSuccess={(el) => handleFastCreateSuccess(el, 'codigo')}
          marcas={marcas}
        />
      )}
      </div>
  )
}

function FastCreateCodigoModal({ isOpen, onClose, onSuccess, marcas }) {
  const [formData, setFormData] = useState({ codigo: '', marca_id: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload = {
        codigo: formData.codigo,
        marca_id: parseInt(formData.marca_id, 10)
      }
      const res = await codigoProductoService.create(payload)
      onSuccess(res.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.detail || err.message || 'Error al guardar el código')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Código de Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          
          <Input
            label="Código"
            name="codigo"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ej: 10.2"
            required
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marca *
            </label>
            <select
              name="marca_id"
              value={formData.marca_id}
              onChange={(e) => setFormData({ ...formData, marca_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Selecciona una marca</option>
              {marcas.map((marca) => (
                <option key={marca.id} value={marca.id}>{marca.nombre}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
