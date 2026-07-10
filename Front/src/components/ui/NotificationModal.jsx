import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore'

export function NotificationModal() {
  const { isOpen, type, title, message, hideNotification } = useNotificationStore()

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        hideNotification()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, hideNotification])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'error': return <XCircle className="w-8 h-8 text-red-600" />
      case 'warning': return <AlertCircle className="w-8 h-8 text-amber-600" />
      case 'success': return <CheckCircle2 className="w-8 h-8 text-green-600" />
      default: return <Info className="w-8 h-8 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'error': return 'bg-red-100'
      case 'warning': return 'bg-amber-100'
      case 'success': return 'bg-green-100'
      default: return 'bg-blue-100'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'error': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500'
      case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
      default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={hideNotification}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className={`flex items-center justify-center w-16 h-16 mx-auto rounded-full mb-4 ${getBgColor()}`}>
            {getIcon()}
          </div>
          
          <h3 className="text-xl font-bold text-center text-slate-900 mb-2">
            {title}
          </h3>
          
          <div className="text-center text-slate-600 mb-6">
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={hideNotification}
              className={`w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center ${getButtonColor()}`}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
