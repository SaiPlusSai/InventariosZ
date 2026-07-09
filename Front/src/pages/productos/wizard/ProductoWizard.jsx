import { useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { productoService } from '../../../services/productoService'
import { productoImagenService } from '../../../services/productoImagenService'

import Step1InformacionGeneral from './Step1InformacionGeneral'
import Step2ConfiguracionVariantes from './Step2ConfiguracionVariantes'

import { Button } from '../../../components/ui'

const steps = [
  { id: 1, title: 'Información General', component: Step1InformacionGeneral },
  { id: 2, title: 'Configuración de Variantes', component: Step2ConfiguracionVariantes },
]

export default function ProductoWizard({ onClose, onSuccess }) {
  const {
    modo,
    codigoProductoId,
    targetColorId,
    currentStep,
    setCurrentStep,
    formData,
    resetWizard,
  } = useWizardStore()

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const CurrentStepComponent =
    steps.find((s) => s.id === currentStep)?.component

  const handleNext = () => {
    if (currentStep < steps.length) {
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

  const triggerFocusError = (msg) => {
    setError(msg)
    setLoading(false)
    setTimeout(() => {
      const el = document.querySelector('.border-red-500')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus()
      }
    }, 100)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    // 1. Validaciones basicas
    if (!formData.codigo || formData.codigo.trim().length < 2) {
      return triggerFocusError("El código debe tener al menos 2 caracteres.")
    }
    if (!formData.marca_id || !formData.tipo_calzado_id || !formData.material_id) {
      return triggerFocusError("Faltan datos en la Información General (Marca, Tipo o Material).")
    }
    if (formData.variantes.length === 0) {
      return triggerFocusError("Debes configurar al menos una variante (color y talla).")
    }

    // Validacion de consistencia numérica en variantes
    for (const [idx, v] of formData.variantes.entries()) {
      if (
        Number(v.stock_actual) < 0 ||
        Number(v.stock_minimo) < 0 ||
        (v.precio_compra !== null && v.precio_compra !== '' && Number(v.precio_compra) < 0) ||
        Number(v.precio_venta) <= 0
      ) {
        return triggerFocusError("No es posible guardar el producto. Corrige los campos resaltados antes de continuar.")
      }
    }

    try {
      // 2. Preparar el payload global para el backend
      const dataToSend = {
        codigo: String(formData.codigo).trim(),
        marca_id: Number(formData.marca_id),
        tipo_calzado_id: Number(formData.tipo_calzado_id),
        material_id: Number(formData.material_id),
        descripcion: formData.descripcion ? String(formData.descripcion).trim() : null,

        variantes: formData.variantes.map((v) => ({
          color_id: Number(v.color_id),
          talla_id: Number(v.talla_id),
          stock_actual: parseInt(v.stock_actual) || 0,
          stock_minimo: parseInt(v.stock_minimo) || 0,
          stock_maximo: v.stock_maximo !== null && v.stock_maximo !== '' ? parseInt(v.stock_maximo) : null,
          precio_compra: v.precio_compra !== null && v.precio_compra !== '' ? parseFloat(v.precio_compra) : null,
          precio_venta: parseFloat(v.precio_venta) || 0,
          estado: v.estado ?? true,
        })),

        imagenes: [], // Las enviamos despues
      }

      let codigoID = null;

      // 3. Crear o Actualizar Producto Base
      if (modo === 'editar') {
        if (targetColorId) {
          // Actualización de un color en específico
          // Las imagenes que ya existen (tienen ID) van al Payload para conservar su orden y flag principal
          dataToSend.imagenes = Object.entries(formData.imagenesPorColor).flatMap(([colorId, imgs]) => 
            imgs.filter(img => img.id).map(img => ({
              id: img.id,
              es_principal: img.es_principal,
              orden: img.orden
            }))
          )
          await productoService.updateColor(
            codigoProductoId,
            targetColorId,
            dataToSend
          )
          codigoID = codigoProductoId
        } else {
          // Actualización completa de múltiples colores
          await productoService.updateCompleto(
            codigoProductoId,
            dataToSend
          )
          codigoID = codigoProductoId
        }
      } else {
        const res = await productoService.createCompleto(
          dataToSend
        )
        codigoID = res.data.codigo_producto_id
      }

      
      // 4. Procesar Imagenes Nuevas
      // Para saber los IDs de las variantes creadas por color, llamamos a getEditarCompleto
      const edicionRes = await productoService.getEditarCompleto(codigoID);
      const variantesGuardadas = edicionRes.data.variantes;

      for (const colorIdStr of Object.keys(formData.imagenesPorColor)) {
        const colorId = Number(colorIdStr);
        // Si estamos editando un color en especifico, ignoramos el resto
        if (targetColorId && colorId !== targetColorId) continue;

        const imagenesDelColor = formData.imagenesPorColor[colorId];
        
        // Filtramos imagenes nuevas que vienen con "file" (las viejas ya estan en backend)
        const imagenesNuevas = imagenesDelColor.filter(img => img.file);
        
        if (imagenesNuevas.length > 0) {
          // Buscamos el ID de la primera variante que tenga este color para atar las imagenes
          const varianteRepresentante = variantesGuardadas.find(v => v.color_id === colorId);
          if (varianteRepresentante) {
            for (const img of imagenesNuevas) {
              const formDataFile = new FormData()
              formDataFile.append('archivo', img.file)
              formDataFile.append('es_principal', img.es_principal)
              formDataFile.append('orden', img.orden)
              
              await productoImagenService.subirImagen(varianteRepresentante.id, formDataFile)
            }
          }
        }
      }

      // 5. Finalizar
      resetWizard()
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    } catch (err) {
      console.error(err)
      setError(
        err.message || 
        err.response?.data?.detail ||
          (modo === 'editar'
            ? 'Error al actualizar el producto.'
            : 'Error al crear el producto.')
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {modo === 'editar'
                ? 'Editar Producto'
                : 'Nuevo Producto'}
            </h2>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex-1"
              >
                <div
                  className={`h-2 rounded-full transition-colors ${
                    step.id <= currentStep
                      ? 'bg-primary-600'
                      : 'bg-gray-200'
                  }`}
                />

                <p className="text-xs text-center mt-1 text-gray-600 font-medium">
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {CurrentStepComponent && (
            <CurrentStepComponent />
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-between items-center gap-3 bg-white rounded-b-lg">

          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={
              currentStep === 1 ||
              loading
            }
          >
            ← Anterior
          </Button>

          <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
            Paso {currentStep} de {steps.length}
          </div>

          {currentStep === steps.length ? (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[150px]"
            >
              {loading
                ? modo === 'editar'
                  ? 'Actualizando...'
                  : 'Guardando...'
                : modo === 'editar'
                ? '💾 Actualizar Producto'
                : '💾 Guardar Producto'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
              className="min-w-[150px]"
            >
              Siguiente →
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}