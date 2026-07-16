import { Trash2, RotateCcw, X, ArchiveX, CheckSquare } from 'lucide-react'
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
    <div className="w-full bg-white border border-primary-200 shadow-sm rounded-xl p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Lado izquierdo: Contador */}
      <div className="flex items-center gap-2 text-primary-700 font-medium px-1">
        <CheckSquare className="w-5 h-5 text-primary-500" />
        <span>
          {selectedCount} {selectedCount === 1 ? 'seleccionado' : 'seleccionados'}
        </span>
      </div>

      {/* Lado derecho: Acciones */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        {!isPapeleraMode ? (
          <Button 
            variant="secondary" 
            className="text-red-600 border-red-200 hover:bg-red-50 bg-white flex items-center justify-center gap-2"
            onClick={onDesactivar}
          >
            <Trash2 className="w-4 h-4" />
            <span>Enviar a Papelera</span>
          </Button>
        ) : (
          <>
            <Button 
              variant="secondary" 
              className="text-green-600 border-green-200 hover:bg-green-50 bg-white flex items-center justify-center gap-2"
              onClick={onRecuperar}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Recuperar</span>
            </Button>
            <Button 
              variant="secondary" 
              className="text-red-600 border-red-200 hover:bg-red-50 bg-white flex items-center justify-center gap-2"
              onClick={onEliminar}
            >
              <ArchiveX className="w-4 h-4" />
              <span>Eliminar Definitivamente</span>
            </Button>
          </>
        )}
        
        <Button 
          variant="ghost" 
          className="text-gray-500 hover:text-gray-700 flex items-center justify-center gap-2"
          onClick={onClear}
        >
          Cancelar<span className="hidden sm:inline">&nbsp;selección</span>
        </Button>
      </div>

    </div>
  )
}
