import { useEffect, useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useColorStore } from '../../../store/colorStore'
import { colorService } from '../../../services/colorService'

export default function Step2Colores() {
  const { formData, setFormData } = useWizardStore()
  const { colores, setColores } = useColorStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadColores = async () => {
      try {
        const res = await colorService.getAll()
        setColores(res.data.data || res.data)
      } catch (error) {
        console.error('Error loading colores:', error)
      } finally {
        setLoading(false)
      }
    }

    loadColores()
  }, [])

  const toggleColor = (colorId) => {
    const newColores = formData.colores.includes(colorId)
      ? formData.colores.filter((id) => id !== colorId)
      : [...formData.colores, colorId]
    setFormData({ colores: newColores })
  }

  if (loading) {
    return <div className="text-center text-gray-600">Cargando colores...</div>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Selecciona los colores</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {colores.map((color) => (
          <button
            key={color.id}
            onClick={() => toggleColor(color.id)}
            className={`p-4 border-2 rounded-lg transition-all ${
              formData.colores.includes(color.id)
                ? 'border-primary-600 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border-2 border-gray-300"
                style={{
                  backgroundColor: color.codigo_hex || '#cccccc',
                }}
              />
              <span className="font-medium">{color.nombre}</span>
            </div>
            {formData.colores.includes(color.id) && (
              <div className="text-primary-600 mt-2">✓ Seleccionado</div>
            )}
          </button>
        ))}
      </div>

      {formData.colores.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          ⚠️ Debes seleccionar al menos un color
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        {formData.colores.length > 0
          ? `✓ ${formData.colores.length} color${formData.colores.length !== 1 ? 'es' : ''} seleccionado${formData.colores.length !== 1 ? 's' : ''}`
          : 'Selecciona los colores para tu producto'}
      </div>
    </div>
  )
}
