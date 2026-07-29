import React, { memo } from 'react'
import { Eye, ArrowUp, ArrowDown } from 'lucide-react'
import { TIPO_MOVIMIENTO_BADGES, ORIGEN_MOVIMIENTO_BADGES } from '../../../constants/movimientos'
import useMovimientoStore from '../../../store/movimientoStore'

const SortIcon = ({ column, sortConfig }) => {
  if (sortConfig.key !== column) return null;
  return sortConfig.direction === 'asc' 
    ? <ArrowUp size={14} className="inline ml-1 text-indigo-600" />
    : <ArrowDown size={14} className="inline ml-1 text-indigo-600" />;
}

const MovimientoTable = memo(({ movimientos = [], onVerDetalle }) => {
  const { sortConfig, setSortConfig } = useMovimientoStore()

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig(key, direction)
  }
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('fecha')}>
                Fecha <SortIcon column="fecha" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('codigo')}>
                Código <SortIcon column="codigo" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('tipo_movimiento')}>
                Movimiento <SortIcon column="tipo_movimiento" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('cantidad')}>
                Cant. <SortIcon column="cantidad" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium text-center">
                Stock (A &rarr; N)
              </th>
              <th className="px-4 py-3 font-medium max-w-[200px]">Observación</th>
              <th className="px-4 py-3 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos.map((m) => {
              const tipoBadge = TIPO_MOVIMIENTO_BADGES[m.tipoMovimiento] || 'bg-slate-100 text-slate-800 border-slate-200';
              const origenBadge = ORIGEN_MOVIMIENTO_BADGES[m.origen] || 'bg-slate-100 text-slate-800 border-slate-200';
              return (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors group text-sm text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{m.codigo || 'N/A'}</div>
                  <div className="text-gray-500 text-xs truncate max-w-[150px]" title={m.productoNombre}>{m.productoNombre}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${tipoBadge}`}>
                    {m.tipoMovimiento}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${origenBadge}`}>
                    {m.origen?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-semibold ${
                    m.tipoMovimiento === 'ENTRADA' ? 'text-emerald-600' :
                    m.tipoMovimiento === 'SALIDA' ? 'text-rose-600' :
                    'text-amber-600'
                  }`}>
                    {m.tipoMovimiento === 'ENTRADA' ? '+' : m.tipoMovimiento === 'SALIDA' ? '-' : ''}
                    {m.cantidad}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    <span className="text-slate-500">{m.stockAnterior}</span>
                    <span className="text-slate-300">&rarr;</span>
                    <span className="font-semibold text-slate-700">{m.stockNuevo}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 max-w-[200px]">
                  <div className="truncate" title={m.observacion || '-'}>
                    {m.observacion || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => onVerDetalle && onVerDetalle(m)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Ver detalle"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default MovimientoTable
