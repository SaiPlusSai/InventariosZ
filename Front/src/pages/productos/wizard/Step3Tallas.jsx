import { useEffect, useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useTallaStore } from '../../../store/tallaStore'
import { tallaService } from '../../../services/tallaService'

export default function Step3Tallas() {
  const { formData, setFormData } = useWizardStore()
  const { tallas, setTallas } = useTallaStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTallas = async () => {
      try {
        const res = await tallaService.getAll()
        setTallas(res.data.data || res.data)
      } catch (error) {
        console.error('Error loading tallas:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTallas()
  }, [])

  const toggleTalla = (tallaId) => {
    const newTallas = formData.tallas.includes(tallaId)
      ? formData.tallas.filter((id) => id !== tallaId)
      : [...formData.tallas, tallaId]
    setFormData({ tallas: newTallas })
  }

  if (loading) {
    return <div className="text-center text-gray-600">Cargando tallas...</div>
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Selecciona las tallas</h3>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {tallas.map((talla) => (
          <button
            key={talla.id}
            onClick={() => toggleTalla(talla.id)}
            className={`p-3 border-2 rounded-lg transition-all font-semibold ${
              formData.tallas.includes(talla.id)
                ? 'border-primary-600 bg-primary-600 text-white'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {talla.numero}
          </button>
        ))}
      </div>

      {formData.tallas.length === 0 && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          ⚠️ Debes seleccionar al menos una talla
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        {formData.tallas.length > 0
          ? `✓ ${formData.tallas.length} talla${formData.tallas.length !== 1 ? 's' : ''} seleccionada${formData.tallas.length !== 1 ? 's' : ''}`
          : 'Selecciona las tallas para tu producto'}
      </div>
    </div>
  )
}
