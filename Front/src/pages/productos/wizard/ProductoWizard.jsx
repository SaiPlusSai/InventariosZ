import { useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { useAsync } from '../../../hooks'
import { productoService } from '../../../services/productoService'
import Step1InformacionGeneral from './Step1InformacionGeneral'
import Step2Colores from './Step2Colores'
import Step3Tallas from './Step3Tallas'
import Step4Variantes from './Step4Variantes'
import Step5Imagenes from './Step5Imagenes'
import Step6Resumen from './Step6Resumen'
import { Button } from '../../../components/ui'

const steps = [
  { id: 1, title: 'Información General', component: Step1InformacionGeneral },
  { id: 2, title: 'Colores', component: Step2Colores },
  { id: 3, title: 'Tallas', component: Step3Tallas },
  { id: 4, title: 'Variantes', component: Step4Variantes },
  { id: 5, title: 'Imágenes', component: Step5Imagenes },
  { id: 6, title: 'Resumen', component: Step6Resumen },
]

export default function ProductoWizard({ onClose }) {
  const { currentStep, setCurrentStep, formData, resetWizard } = useWizardStore()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const CurrentStepComponent = steps.find((s) => s.id === currentStep)?.component

  const handleNext = async () => {
    // Validar paso actual antes de pasar al siguiente
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
      setError(null)
    }
  }

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      // Preparar datos para enviar (remover campos internos)
      const dataToSend = {
        codigo: formData.codigo,
        marca_id: formData.marca_id,
        tipo_calzado_id: formData.tipo_calzado_id,
        material_id: formData.material_id,
        descripcion: formData.descripcion,
        variantes: formData.variantes.map(v => ({
          color_id: v.color_id,
          talla_id: v.talla_id,
          stock_actual: v.stock_actual,
          stock_minimo: v.stock_minimo,
          stock_maximo: v.stock_maximo,
          precio_compra: v.precio_compra,
          precio_venta: v.precio_venta,
          estado: v.estado,
        })),
        imagenes: formData.imagenes.map(i => ({
          bucket: i.bucket,
          ruta: i.ruta,
          nombre_archivo: i.nombre_archivo,
          es_principal: i.es_principal,
          orden: i.orden,
        })),
      }
      
      await productoService.createCompleto(dataToSend)
      resetWizard()
      onClose()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Error al crear el producto. Intenta nuevamente.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Nuevo Producto</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          {/* Indicador de pasos */}
          <div className="mt-4 flex gap-2">
            {steps.map((step) => (
              <div key={step.id} className="flex-1">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    step.id <= currentStep
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                  }`}
                />
                <p className="text-xs text-center mt-1 text-gray-600">
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {CurrentStepComponent && <CurrentStepComponent />}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex gap-3 justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 1 || loading}
          >
            ← Anterior
          </Button>

          <div className="text-sm text-gray-600">
            Paso {currentStep} de {steps.length}
          </div>

          {currentStep === steps.length ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Guardando...' : '✓ Guardar Producto'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
            >
              Siguiente →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
