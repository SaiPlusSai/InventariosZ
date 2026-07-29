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
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Color</th>
              <th className="px-4 py-3 font-medium">Talla</th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('tipo_movimiento')}>
                Movimiento <SortIcon column="tipo_movimiento" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium">Origen</th>
              <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('cantidad')}>
                Cant. <SortIcon column="cantidad" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('stock_anterior')} title="Stock Anterior">
                Ant. <SortIcon column="stock_anterior" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-indigo-600 select-none transition-colors" onClick={() => handleSort('stock_nuevo')} title="Stock Después">
                Desp. <SortIcon column="stock_nuevo" sortConfig={sortConfig} />
              </th>
              <th className="px-4 py-3 font-medium">Observación</th>
              <th className="px-4 py-3 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {movimientos.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors group text-sm text-slate-700">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 font-medium text-indigo-600">{m.codigo}</td>
                <td className="px-4 py-3">{m.marca}</td>
                <td className="px-4 py-3 truncate max-w-[120px]" title={m.tipoCalzado}>{m.tipoCalzado}</td>
                <td className="px-4 py-3">{m.color}</td>
                <td className="px-4 py-3">{m.talla}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full ${TIPO_MOVIMIENTO_BADGES[m.tipoMovimiento] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                    {m.tipoMovimiento}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-[11px] font-semibold border rounded-full ${ORIGEN_MOVIMIENTO_BADGES[m.origen] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                    {m.origen?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">{m.cantidad}</td>
                <td className="px-4 py-3 text-right text-slate-500">{m.stockAnterior}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">{m.stockNuevo}</td>
                <td className="px-4 py-3 truncate max-w-[150px]" title={m.observacion}>
                  {m.observacion || '-'}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
})

export default MovimientoTable
