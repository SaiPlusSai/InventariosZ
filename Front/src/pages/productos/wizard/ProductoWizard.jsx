import { useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { productoService } from '../../../services/productoService'
import { productoImagenService } from '../../../services/productoImagenService'
import { useWarningManager } from '../../../hooks/useWarningManager'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

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
    grupoId,
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

  const processSave = async (dataToSend, toastId) => {
    let codigoID = null;

    // 3. Crear o Actualizar Producto Base
    if (modo === 'editar') {
      if (targetColorId) {
        dataToSend.imagenes = Object.entries(formData.imagenesPorColor).flatMap(([colorId, imgs]) => 
          imgs.filter(img => img.id).map(img => ({
            id: img.id,
            es_principal: img.es_principal,
            orden: img.orden
          }))
        )
        await productoService.updateColor(
          grupoId,
          targetColorId,
          dataToSend
        )
        codigoID = grupoId
      } else {
        await productoService.updateCompleto(
          grupoId,
          dataToSend
        )
        codigoID = grupoId
      }
    } else {
      const res = await productoService.createCompleto(dataToSend)
      console.log('✅ createCompleto response:', res.data)
      codigoID = res.data.grupo_id || res.data.producto_principal_id
    }

    // 4. Procesar Imagenes Nuevas
    const edicionRes = await productoService.getEditarCompleto(codigoID);
    const variantesGuardadas = edicionRes.data.variantes;

    for (const colorIdStr of Object.keys(formData.imagenesPorColor)) {
      const colorId = Number(colorIdStr);
      if (targetColorId && colorId !== targetColorId) continue;

      const imagenesDelColor = formData.imagenesPorColor[colorId];
      const imagenesNuevas = imagenesDelColor.filter(img => img.file);
      
      if (imagenesNuevas.length > 0) {
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
    if (modo === 'editar') {
      toast.success('Producto actualizado correctamente', { id: toastId })
    } else {
      toast.success('Producto creado correctamente', { id: toastId })
    }
    resetWizard()
    if (onSuccess) {
      onSuccess()
    } else {
      onClose()
    }
  }

  const { handleWarningError, WarningComponent } = useWarningManager(async (dataToSendWithForce) => {
    let retryToastId;
    try {
      retryToastId = toast.loading(modo === 'editar' ? 'Actualizando producto...' : 'Creando producto...')
      await processSave(dataToSendWithForce, retryToastId)
    } catch (err) {
      console.error(err)
      toast.error(
        err.customMessage ||
        (modo === 'editar' ? 'Error al actualizar el producto.' : 'Error al crear el producto.'),
        { id: retryToastId }
      )
      setError(
        err.customMessage ||
        (modo === 'editar' ? 'Error al actualizar el producto.' : 'Error al crear el producto.')
      )
    }
  })

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    
    // 1. Validaciones basicas
    if (!formData.codigo_producto_id) {
      return triggerFocusError("Debes seleccionar un código de producto.")
    }
    if (!formData.descripcion || !formData.descripcion.trim()) {
    return triggerFocusError("La descripción del producto es obligatoria.")
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

    let toastId;
    try {
      toastId = toast.loading(modo === 'editar' ? 'Actualizando producto...' : 'Creando producto...')
      // 2. Preparar el payload global para el backend
      const dataToSend = {
        codigo_producto_id: Number(formData.codigo_producto_id),
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
      
      console.log('📤 dataToSend:', dataToSend)

      await processSave(dataToSend, toastId)

    } catch (err) {
      console.error(err)
      // dataToSend está dentro de este closure, la recuperamos interceptando el warning
      const dataToSend = {
        codigo_producto_id: Number(formData.codigo_producto_id),
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
        imagenes: [],
      }

      const isWarning = handleWarningError(err, dataToSend)
      if (!isWarning) {
        toast.error(
          err.customMessage ||
          (modo === 'editar'
            ? 'Error al actualizar el producto.'
            : 'Error al crear el producto.'),
          { id: toastId }
        )
        setError(
          err.customMessage ||
          (modo === 'editar'
            ? 'Error al actualizar el producto.'
            : 'Error al crear el producto.')
        )
      } else {
        toast.dismiss(toastId)
      }
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
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
        <div className="border-t px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-between items-center gap-3 bg-white rounded-b-lg">

          <Button
            variant="ghost"
            onClick={handlePrev}
            className="w-full sm:w-auto"
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
              className="w-full sm:w-auto min-w-[150px]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{modo === 'editar' ? 'Actualizando...' : 'Guardando...'}</span>
                </div>
              ) : (
                <span>{modo === 'editar' ? '💾 Actualizar Producto' : '💾 Guardar Producto'}</span>
              )}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={loading}
              className="w-full sm:w-auto min-w-[150px]"
            >
              Siguiente →
            </Button>
          )}
        </div>
      </div>
      {WarningComponent}
    </div>
  )
}