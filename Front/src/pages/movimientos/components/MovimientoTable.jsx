import React from 'react'

export default function MovimientoTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4 font-medium">Fecha</th>
              <th className="px-6 py-4 font-medium">Código</th>
              <th className="px-6 py-4 font-medium">Producto</th>
              <th className="px-6 py-4 font-medium">Movimiento</th>
              <th className="px-6 py-4 font-medium">Origen</th>
              <th className="px-6 py-4 font-medium text-right">Cantidad</th>
              <th className="px-6 py-4 font-medium text-right">Stock Anterior</th>
              <th className="px-6 py-4 font-medium text-right">Stock Nuevo</th>
              <th className="px-6 py-4 font-medium">Observación</th>
              <th className="px-6 py-4 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Las filas se renderizarán en los próximos Sprints */}
          </tbody>
        </table>
      </div>
    </div>
  )
}
