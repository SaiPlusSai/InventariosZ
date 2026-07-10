import React from 'react'
import { AlertCircle } from 'lucide-react'

export function WarningModal({ isOpen, onClose, onConfirm, warningData, loading }) {
  if (!isOpen || !warningData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-amber-100 rounded-full mb-4">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-center text-slate-900 mb-2">
            Código existente
          </h3>
          
          <div className="text-center text-slate-600 space-y-3 mb-6">
            <p>El código:</p>
            <p className="font-mono font-bold text-slate-900 bg-slate-100 py-1 rounded">{warningData.codigo}</p>
            <p>ya se encuentra registrado para la marca:</p>
            <p className="font-semibold text-slate-900">{warningData.marca_conflicto}</p>
            <p>Está intentando asociarlo también a:</p>
            <p className="font-semibold text-amber-700">{warningData.marca_destino}</p>
            <p className="pt-2 font-medium">¿Desea continuar?</p>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Guardar de todas formas'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
