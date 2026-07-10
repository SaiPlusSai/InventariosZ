import { useState, useEffect } from 'react'
import Button from './Button' // Assuming Button exists in ui

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  service,
  item,
  isPhysicalDelete = false
}) {
  const [loadingDeps, setLoadingDeps] = useState(false)
  const [dependencies, setDependencies] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (isOpen && item) {
      loadDependencies()
    } else {
      setDependencies(null)
    }
  }, [isOpen, item])

  const loadDependencies = async () => {
    try {
      setLoadingDeps(true)
      const res = await service.getDependencias(item.id)
      setDependencies(res.data) // Assuming backend returns { dependencias: { ... } } or just the dict
    } catch (err) {
      console.error('Error cargando dependencias', err)
      // Even if it fails, maybe it doesn't have any or the endpoint is missing
      setDependencies({})
    } finally {
      setLoadingDeps(false)
    }
  }

  const handleConfirm = async () => {
    try {
      setProcessing(true)
      if (isPhysicalDelete) {
        await service.delete(item.id)
      } else {
        await service.desactivar(item.id)
      }
      onConfirm() // Trigger refresh in parent
      onClose()
    } catch (err) {
      console.error(err)
      import('../../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          err.response?.data?.detail || err.customMessage || 'Error al eliminar el registro'
        )
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen || !item) return null

  // Helper to format dependencies nicely
  const renderDependencies = () => {
    if (loadingDeps) return <p className="text-gray-500 italic">Consultando registros relacionados...</p>
    if (!dependencies) return null

    // We assume backend returns something like { codigo_producto: 6, producto: 24 }
    // Or { nombre: 'Nike', dependencias: { ... } }
    const depsObj = dependencies.dependencias || dependencies
    const keys = Object.keys(depsObj).filter(k => k !== 'nombre')

    if (keys.length === 0) {
      return <p className="text-sm text-gray-600 my-2">No se encontraron registros relacionados dependientes.</p>
    }

    return (
      <div className="my-4">
        {isPhysicalDelete ? (
          <p className="font-semibold text-red-600 mb-2">Se eliminarán permanentemente los siguientes registros relacionados:</p>
        ) : (
          <p className="font-semibold text-gray-700 mb-2">Se encontraron los siguientes registros relacionados:</p>
        )}
        <ul className="list-disc pl-5 text-sm text-gray-700">
          {keys.map((key) => {
            if (depsObj[key] > 0) {
               // Format key: "codigo_producto" -> "Codigo producto"
               const label = key.replace(/_/g, ' ')
               return (
                 <li key={key} className="capitalize">
                   {label}: <span className="font-semibold">{depsObj[key]}</span>
                 </li>
               )
            }
            return null
          })}
        </ul>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isPhysicalDelete ? 'bg-red-50' : 'bg-orange-50'}`}>
          <h2 className={`text-xl font-bold ${isPhysicalDelete ? 'text-red-700' : 'text-orange-700'}`}>
            {isPhysicalDelete ? 'Eliminar Permanentemente' : 'Eliminar Registro'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-800 mb-2">
            ¿Está seguro de {isPhysicalDelete ? 'eliminar permanentemente' : 'eliminar'} el registro <strong>"{item.nombre || item.codigo || item.id}"</strong>?
          </p>
          
          {isPhysicalDelete ? (
             <p className="text-sm text-red-600 font-medium my-2">Esta acción NO podrá deshacerse.</p>
          ) : (
             <p className="text-sm text-gray-600 my-2">Esta acción enviará el registro a la Papelera. Los registros dejarán de mostrarse en el sistema pero podrán recuperarse posteriormente desde la Papelera.</p>
          )}

          {renderDependencies()}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex justify-end gap-3 bg-gray-50">
          <Button variant="ghost" onClick={onClose} disabled={processing}>
            Cancelar
          </Button>
          
          <button 
            onClick={handleConfirm} 
            disabled={processing || loadingDeps}
            className={`px-4 py-2 rounded font-medium text-white transition-colors ${
              processing || loadingDeps ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              isPhysicalDelete 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {processing 
              ? 'Procesando...' 
              : (isPhysicalDelete ? 'Eliminar Permanentemente' : 'Confirmar')
            }
          </button>
        </div>

      </div>
    </div>
  )
}
