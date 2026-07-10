import { useState, useEffect } from 'react'
import { AlertTriangle, Info, Trash2, RotateCcw, Loader2 } from 'lucide-react'
import Button from './Button'

/**
 * ConfirmModal
 * Modal global para confirmar acciones destructivas, sensibles o recuperaciones.
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {function} onConfirm
 * @param {string} title
 * @param {string} message
 * @param {string} confirmText
 * @param {string} cancelText
 * @param {string} variant - 'danger' | 'warning' | 'info' | 'success'
 * @param {boolean} isLoading - Manejado externamente si se pasa la funcion asincrona
 * @param {object} dependencyConfig - { service, itemId, isPhysicalDelete } opcional para cargar dependencias antes de eliminar
 */
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Está seguro de realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  isLoading = false,
  dependencyConfig = null
}) {
  const [loadingDeps, setLoadingDeps] = useState(false)
  const [dependencies, setDependencies] = useState(null)
  const [localProcessing, setLocalProcessing] = useState(false)

  useEffect(() => {
    if (isOpen && dependencyConfig?.service && dependencyConfig?.itemId) {
      loadDependencies()
    } else {
      setDependencies(null)
    }
  }, [isOpen, dependencyConfig?.itemId])

  const loadDependencies = async () => {
    try {
      setLoadingDeps(true)
      const res = await dependencyConfig.service.getDependencias(dependencyConfig.itemId)
      setDependencies(res.data)
    } catch (err) {
      console.error('Error cargando dependencias', err)
      setDependencies({})
    } finally {
      setLoadingDeps(false)
    }
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading && !localProcessing) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, localProcessing, onClose])

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLocalProcessing(true)
    try {
      await onConfirm()
    } finally {
      setLocalProcessing(false)
    }
  }

  const isProcessing = isLoading || localProcessing

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          bgIcon: 'bg-red-100',
          btnConfirm: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
        }
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          bgIcon: 'bg-amber-100',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500'
        }
      case 'success':
        return {
          icon: <RotateCcw className="w-6 h-6 text-green-600" />,
          bgIcon: 'bg-green-100',
          btnConfirm: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
        }
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          bgIcon: 'bg-blue-100',
          btnConfirm: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
        }
    }
  }

  const styles = getVariantStyles()

  const renderDependencies = () => {
    if (!dependencyConfig) return null
    if (loadingDeps) return <div className="mt-4 text-sm text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Consultando registros relacionados...</div>
    if (!dependencies) return null

    const depsObj = dependencies.dependencias || dependencies
    const keys = Object.keys(depsObj).filter(k => k !== 'nombre')

    if (keys.length === 0) {
      return <p className="text-sm text-gray-600 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">No se encontraron registros relacionados dependientes.</p>
    }

    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <p className={`text-sm font-semibold mb-2 ${dependencyConfig.isPhysicalDelete ? 'text-red-600' : 'text-gray-700'}`}>
          {dependencyConfig.isPhysicalDelete 
            ? 'Se eliminarán permanentemente los siguientes registros relacionados:' 
            : 'Se encontraron los siguientes registros relacionados:'}
        </p>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {keys.map((key) => {
            if (depsObj[key] > 0) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => {
      if(!isProcessing && !loadingDeps) onClose()
    }}>
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${styles.bgIcon}`}>
              {styles.icon}
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <div className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {message}
              </div>
              
              {renderDependencies()}

            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isProcessing || loadingDeps}
            className="text-gray-600 hover:text-gray-900"
          >
            {cancelText}
          </Button>
          
          <button 
            type="button"
            onClick={handleConfirm} 
            disabled={isProcessing || loadingDeps}
            className={`px-4 py-2 text-sm font-medium border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center min-w-[120px] ${styles.btnConfirm} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Procesando...
              </>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
