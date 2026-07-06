import { useEffect, useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useMarcaStore } from '../../../store/marcaStore'
import { useTipoCalzadoStore } from '../../../store/tipoCalzadoStore'
import { useMaterialStore } from '../../../store/materialStore'
import { marcaService } from '../../../services/marcaService'
import { tipoCalzadoService } from '../../../services/tipoCalzadoService'
import { materialService } from '../../../services/materialService'
import { Input } from '../../../components/ui'

export default function Step1InformacionGeneral() {
  const { formData, setFormData } = useWizardStore()
  const { marcas, setMarcas } = useMarcaStore()
  const { tipos, setTipos } = useTipoCalzadoStore()
  const { materiales, setMateriales } = useMaterialStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [marcasRes, tiposRes, materialesRes] = await Promise.all([
          marcaService.getAll(),
          tipoCalzadoService.getAll(),
          materialService.getAll(),
        ])
        setMarcas(marcasRes.data.data || marcasRes.data)
        setTipos(tiposRes.data.data || tiposRes.data)
        setMateriales(materialesRes.data.data || materialesRes.data)
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
    
    setFormData({
      [name]: parsedValue,
    })
  }

  if (loading) {
    return <div className="text-center text-gray-600">Cargando...</div>
  }

  return (
    <div className="space-y-4">
      <Input
        label="Código del Producto"
        name="codigo"
        value={formData.codigo}
        onChange={handleChange}
        placeholder="Ej: PROD-001"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marca *
        </label>
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material *
        </label>
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
      </div>
    </div>
  )
}
