import { Trash2, RotateCcw, X, ArchiveX } from 'lucide-react'
import { Button } from '../../components/ui'

export default function BulkActionBar({
  selectedCount,
  isPapeleraMode,
  onClear,
  onDesactivar,
  onRecuperar,
  onEliminar
}) {
  if (selectedCount === 0) return null

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-gray-900 text-white shadow-xl rounded-full px-4 py-2.5 flex items-center gap-4 text-sm whitespace-nowrap border border-gray-700/50">
        
        {/* Contador */}
        <div className="flex items-center gap-3 pr-4 border-r border-gray-700/50">
          <span className="flex items-center justify-center bg-primary-500 text-white font-bold h-6 w-6 rounded-full text-xs">
            {selectedCount}
          </span>
          <span className="font-medium">
            {selectedCount === 1 ? 'producto seleccionado' : 'productos seleccionados'}
          </span>
        </div>

        {/* Acciones Generales */}
        <div className="flex items-center gap-2">
          {!isPapeleraMode ? (
            <button 
              onClick={onDesactivar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Enviar a Papelera
            </button>
          ) : (
            <>
              <button 
                onClick={onRecuperar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-green-400 hover:text-green-300"
              >
                <RotateCcw className="w-4 h-4" />
                Recuperar
              </button>
              <button 
                onClick={onEliminar}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-800 transition-colors text-red-500 hover:text-red-400 font-medium"
              >
                <ArchiveX className="w-4 h-4" />
                Eliminar Definitivamente
              </button>
            </>
          )}
        </div>

        {/* Cancelar / Limpiar */}
        <div className="pl-2 border-l border-gray-700/50">
          <button 
            onClick={onClear}
            className="flex items-center justify-center p-1.5 rounded-full hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
            title="Cancelar selección"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  )
}
