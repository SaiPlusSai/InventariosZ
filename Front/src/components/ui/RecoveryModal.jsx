import React from 'react'
import { Button } from '.'

export function RecoveryModal({ isOpen, onClose, onRecover, itemName, loading }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[70]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Registro en Papelera</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            El registro <strong>"{itemName}"</strong> se encuentra en la Papelera.
          </p>
          <p className="text-gray-700 font-medium mb-6">
            ¿Desea recuperarlo?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="button" variant="primary" onClick={onRecover} disabled={loading}>
              {loading ? 'Recuperando...' : 'Recuperar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
