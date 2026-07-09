import React, { useState } from 'react'
import { X } from 'lucide-react'
import Input from './Input'
import Button from './Button'

export default function FastCreateModal({ isOpen, onClose, title, inputLabel, apiService, onSuccess }) {
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setLoading(true)
    setError(null)
    try {
      // Intentamos crearlo
      const res = await apiService.create({ nombre: nombre.trim() })
      // La API retorna el registro en res.data o res.data.data dependiendo del módulo
      const nuevoRegistro = res.data?.data || res.data
      setNombre('')
      onSuccess(nuevoRegistro)
    } catch (err) {
      setError(err.customMessage || 'Error al guardar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <Input
            label={inputLabel}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Escriba aquí..."
            autoFocus
            disabled={loading}
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading || !nombre.trim()}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
