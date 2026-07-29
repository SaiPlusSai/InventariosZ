import React, { memo } from 'react'
import { Eye } from 'lucide-react'
import { TIPO_MOVIMIENTO_BADGES, ORIGEN_MOVIMIENTO_BADGES } from '../../../constants/movimientos'

const MovimientoCard = memo(({ movimiento, onVerDetalle }) => {
  if (!movimiento) return null

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Encabezado: Fecha y Tipo de Movimiento */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-slate-500 font-medium">Fecha</div>
          <div className="font-semibold text-slate-800 text-sm">
            {new Date(movimiento.fecha).toLocaleDateString('es-ES', { 
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`px-2 py-1 text-[10px] font-semibold border rounded-full ${TIPO_MOVIMIENTO_BADGES[movimiento.tipoMovimiento] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
            {movimiento.tipoMovimiento}
          </span>
        </div>
      </div>
      
      {/* Cuerpo: Producto, Códigos y Origen */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-1 border-t border-slate-100 pt-3">
        <div className="col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-500">Producto / Código</div>
          <div className="font-medium text-indigo-600 truncate">{movimiento.codigo}</div>
          <div className="text-slate-600 text-xs truncate" title={movimiento.productoNombre}>
            {movimiento.marca} • {movimiento.tipoCalzado}
          </div>
          <div className="text-slate-500 text-xs truncate">
            {movimiento.color} • {movimiento.talla}
          </div>
        </div>
        
        <div className="col-span-2 sm:col-span-1 flex flex-col sm:items-end justify-center gap-2">
           <span className={`px-2 py-1 text-[10px] font-semibold border rounded-full self-start sm:self-end ${ORIGEN_MOVIMIENTO_BADGES[movimiento.origen] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
             {movimiento.origen?.replace('_', ' ')}
           </span>
        </div>
      </div>

      {/* Footer: Cantidades y Observación */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Ant.</div>
          <div className="font-medium text-slate-600">{movimiento.stockAnterior}</div>
        </div>
        <div className="text-center border-x border-slate-200">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Movi.</div>
          <div className="font-bold text-slate-900">{movimiento.cantidad}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Nuev.</div>
          <div className="font-medium text-slate-700">{movimiento.stockNuevo}</div>
        </div>
      </div>
      
      {movimiento.observacion && (
        <div className="text-xs text-slate-600 bg-amber-50/50 p-2 rounded-md border border-amber-100/50 truncate">
          <span className="font-medium text-slate-500 mr-1">Obs:</span>
          {movimiento.observacion}
        </div>
      )}

      {/* Acciones */}
      <div className="flex justify-end mt-1">
        <button 
          onClick={() => onVerDetalle && onVerDetalle(movimiento)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Eye size={14} />
          <span>Ver detalle</span>
        </button>
      </div>
    </div>
  )
})

export default MovimientoCard
