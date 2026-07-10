import React, { useState } from 'react'
import { RecoveryModal } from '../components/ui/RecoveryModal'

export function useRecoveryManager(apiService, onSuccess) {
  const [recoveryState, setRecoveryState] = useState({ isOpen: false, id: null, name: '' })
  const [recovering, setRecovering] = useState(false)

  const handleRecoveryError = (err, itemName) => {
    if (err.isPapelera) {
      setRecoveryState({ isOpen: true, id: err.papeleraData.id_registro, name: itemName })
      return true // Indica que el error fue manejado por la recuperación
    }
    return false // No fue manejado
  }

  const performRecovery = async () => {
    if (!recoveryState.id || !apiService.recuperar) return
    setRecovering(true)
    try {
      await apiService.recuperar(recoveryState.id)
      
      const res = await apiService.getById(recoveryState.id)
      const registroRecuperado = res.data?.data || res.data
      
      setRecoveryState({ isOpen: false, id: null, name: '' })
      
      if (onSuccess) onSuccess(registroRecuperado)
    } catch (error) {
      import('../store/notificationStore').then(store => {
        store.useNotificationStore.getState().showNotification(
          'error',
          'Error de recuperación',
          error.customMessage || 'Error al recuperar el registro'
        )
      })
    } finally {
      setRecovering(false)
    }
  }

  const RecoveryComponent = (
    <RecoveryModal
      isOpen={recoveryState.isOpen}
      onClose={() => setRecoveryState({ isOpen: false, id: null, name: '' })}
      onRecover={performRecovery}
      itemName={recoveryState.name}
      loading={recovering}
    />
  )

  return { handleRecoveryError, RecoveryComponent }
}
