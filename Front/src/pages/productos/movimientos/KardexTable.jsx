import React, { useEffect, useState } from 'react';
import useMovimientoStore from '../../../store/movimientoStore';
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

const KardexTable = ({ productoId }) => {
  const { fetchKardex, movimientos, loading, error } = useMovimientoStore();
  const [skip, setSkip] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (productoId) {
      fetchKardex(productoId, skip, limit);
    }
  }, [productoId, skip, fetchKardex]);

  if (loading && movimientos.length === 0) {
    return <div className="p-4 text-center text-gray-500">Cargando Kardex...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  const renderIcon = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return <ArrowDownRight size={16} className="text-green-500" />;
      case 'SALIDA': return <ArrowUpRight size={16} className="text-red-500" />;
      case 'AJUSTE': return <ArrowRightLeft size={16} className="text-yellow-500" />;
      default: return null;
    }
  };

  const renderColor = (tipo) => {
    switch (tipo) {
      case 'ENTRADA': return 'text-green-600 bg-green-50';
      case 'SALIDA': return 'text-red-600 bg-red-50';
      case 'AJUSTE': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Operación</th>
              <th className="py-3 px-4">Motivo / Origen</th>
              <th className="py-3 px-4 text-center">Cantidad</th>
              <th className="py-3 px-4 text-center">Stock Antes</th>
              <th className="py-3 px-4 text-center">Stock Final</th>
              <th className="py-3 px-4">Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-500">
                  No hay movimientos registrados para este producto.
                </td>
              </tr>
            ) : (
              movimientos.map((mov) => (
                <tr key={mov.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    {new Date(mov.created_at).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-3 px-4">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${renderColor(mov.tipo_movimiento)}`}>
                      {renderIcon(mov.tipo_movimiento)}
                      {mov.tipo_movimiento}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-700">
                    {mov.origen.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    {mov.tipo_movimiento === 'SALIDA' ? '-' : '+'}{mov.cantidad}
                  </td>
                  <td className="py-3 px-4 text-center text-gray-500">
                    {mov.stock_anterior}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-gray-900">
                    {mov.stock_nuevo}
                  </td>
                  <td className="py-3 px-4 text-gray-500 truncate max-w-xs" title={mov.observacion}>
                    {mov.observacion || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Paginación simple MVP */}
      <div className="p-4 flex justify-between items-center border-t bg-gray-50">
        <button 
          onClick={() => setSkip(Math.max(0, skip - limit))}
          disabled={skip === 0}
          className="px-3 py-1 text-sm border rounded bg-white disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm text-gray-500">Viendo últimos registros...</span>
        <button 
          onClick={() => setSkip(skip + limit)}
          disabled={movimientos.length < limit}
          className="px-3 py-1 text-sm border rounded bg-white disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default KardexTable;
