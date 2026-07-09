import React, { useState } from 'react'
import { X } from 'lucide-react'
import Input from './Input'
import Button from './Button'
import { getHexFromColorName } from '../../utils/colorDictionary'

export default function FastCreateModal({ 
  isOpen, 
  onClose, 
  title, 
  inputLabel, 
  apiService, 
  onSuccess,
  hasDescription = false,
  isColor = false,
  transformPayload
}) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [codigoHex, setCodigoHex] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [papeleraError, setPapeleraError] = useState(null)

  if (!isOpen) return null

  const handleNombreChange = (e) => {
    const val = e.target.value
    setNombre(val)
    if (isColor) {
      const hex = getHexFromColorName(val)
      if (hex) setCodigoHex(hex)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return

    setLoading(true)
    setError(null)
    try {
      let payload = { nombre: nombre.trim() }
      if (hasDescription) payload.descripcion = descripcion.trim()
      if (isColor && codigoHex.trim()) payload.codigo_hex = codigoHex.trim()

      if (transformPayload) {
        payload = transformPayload(payload)
      }

      const res = await apiService.create(payload)
      const nuevoRegistro = res.data?.data || res.data
      
      // Reset state
      setNombre('')
      setDescripcion('')
      setCodigoHex('')
      setPapeleraError(null)
      
      onSuccess(nuevoRegistro)
    } catch (err) {
      if (err.isPapelera) {
        setPapeleraError(err)
      } else {
        setError(err.customMessage || 'Error al guardar el registro')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRecuperar = async () => {
    if (!papeleraError || !apiService.recuperar) return
    setLoading(true)
    setError(null)
    try {
      const idRegistro = papeleraError.papeleraData.id_registro
      await apiService.recuperar(idRegistro)
      
      // Intentar obtener el registro ya recuperado (o delegar al padre si re-fetchea)
      // Como el FastCreateModal espera devolver el nuevo registro, lo ideal es obtenerlo:
      const res = await apiService.getById(idRegistro)
      const registroRecuperado = res.data?.data || res.data

      setNombre('')
      setDescripcion('')
      setCodigoHex('')
      setPapeleraError(null)

      onSuccess(registroRecuperado)
    } catch (err) {
      setError(err.customMessage || 'Error al recuperar el registro')
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

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          {papeleraError && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-2">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {papeleraError.customMessage}
                  </p>
                  <p className="text-sm font-medium text-yellow-700 mt-2">
                    ¿Deseas recuperarlo?
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <Input
            label={inputLabel}
            value={nombre}
            onChange={handleNombreChange}
            placeholder="Escriba aquí..."
            autoFocus
            disabled={loading}
          />

          {hasDescription && (
            <Input
              label="Descripción (Opcional)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escriba una descripción..."
              disabled={loading}
            />
          )}

          {isColor && (
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  label="Código Hex (Opcional)"
                  value={codigoHex}
                  onChange={(e) => setCodigoHex(e.target.value)}
                  placeholder="ej. #FF0000"
                  disabled={loading}
                />
              </div>
              <div className="mb-1 flex items-center justify-center">
                <input 
                  type="color" 
                  value={codigoHex || '#000000'} 
                  onChange={(e) => setCodigoHex(e.target.value)}
                  className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                  disabled={loading}
                  title="Seleccionar color visualmente"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            {papeleraError ? (
              <Button type="button" variant="primary" onClick={handleRecuperar} disabled={loading}>
                {loading ? 'Recuperando...' : 'Sí, Recuperar'}
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
