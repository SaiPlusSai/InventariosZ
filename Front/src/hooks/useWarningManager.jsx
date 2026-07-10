import React, { useState } from 'react'
import { WarningModal } from '../components/ui/WarningModal'

export function useWarningManager(onConfirmRetry) {
  const [warningState, setWarningState] = useState({ 
    isOpen: false, 
    warningData: null,
    originalData: null
  })
  const [loading, setLoading] = useState(false)

  const handleWarningError = (err, originalData) => {
    if (err.isWarning) {
      setWarningState({ 
        isOpen: true, 
        warningData: err.warningData,
        originalData: originalData
      })
      return true // Indica que el error fue manejado por la advertencia
    }
    return false // No fue manejado
  }

  const performRetry = async () => {
    if (!warningState.originalData || !onConfirmRetry) return
    
    setLoading(true)
    try {
      // Reintentar con force = true
      await onConfirmRetry({ ...warningState.originalData, force: true })
      setWarningState({ isOpen: false, warningData: null, originalData: null })
    } catch (error) {
      // Si falla incluso con force, mostramos el mensaje que venga del backend
      import('../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error',
          error.customMessage || 'Error al guardar el registro'
        )
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setWarningState({ isOpen: false, warningData: null, originalData: null })
  }

  const WarningComponent = (
    <WarningModal
      isOpen={warningState.isOpen}
      onClose={handleClose}
      onConfirm={performRetry}
      warningData={warningState.warningData}
      loading={loading}
    />
  )

  return { handleWarningError, WarningComponent }
}
