import React from 'react'

export default function MovimientoCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
      {/* Las cards de mobile se implementarán en los próximos Sprints */}
      <div className="flex flex-col gap-3">
        {/* Placeholder para la estructura base pedida en el Sprint */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs text-slate-500 font-medium">Fecha</div>
            <div className="font-semibold text-slate-800">--</div>
          </div>
          <div>
            <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              Movimiento
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-1">
          <div>
            <div className="text-xs text-slate-500">Producto / Código</div>
            <div className="font-medium text-slate-700 truncate">--</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Origen</div>
            <div className="font-medium text-slate-700">--</div>
          </div>
          
          <div>
            <div className="text-xs text-slate-500">Cantidad</div>
            <div className="font-medium text-slate-900">--</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Stock (Ant → Nuev)</div>
            <div className="font-medium text-slate-700">-- → --</div>
          </div>
        </div>
      </div>
    </div>
  )
}
