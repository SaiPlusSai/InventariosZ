import { Warehouse } from 'lucide-react'

import MetricCard from './MetricCard'
import ProgressStock from './ProgressStock'

export default function InventarioTab({ producto }) {
  const stockTotal = producto.variantes?.reduce((acc, v) => acc + v.stock_actual, 0) || producto.stock_actual
  const minimoTotal = producto.variantes?.reduce((acc, v) => acc + v.stock_minimo, 0) || producto.stock_minimo
  const maximoTotal = producto.variantes?.reduce((acc, v) => acc + (v.stock_maximo || 0), 0) || producto.stock_maximo

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Inventario Global del Producto</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          icon={<Warehouse />}
          title="Stock Actual Total"
          value={stockTotal}
        />
        <MetricCard
          icon={<Warehouse />}
          title="Stock Mínimo Total"
          value={minimoTotal}
        />
        <MetricCard
          icon={<Warehouse />}
          title="Stock Máximo Total"
          value={maximoTotal || '-'}
        />
      </div>

      <ProgressStock
        actual={stockTotal}
        minimo={minimoTotal}
        maximo={maximoTotal}
      />

      {producto.variantes && producto.variantes.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-4">Desglose por Variante</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3">Color</th>
                  <th className="px-6 py-3">Talla</th>
                  <th className="px-6 py-3">Stock Actual</th>
                  <th className="px-6 py-3">Stock Mínimo</th>
                  <th className="px-6 py-3">Stock Máximo</th>
                  <th className="px-6 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {producto.variantes.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: v.color.codigo_hex || '#ccc' }}
                      />
                      {v.color.nombre}
                    </td>
                    <td className="px-6 py-4 font-semibold">{v.talla.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        v.stock_actual <= v.stock_minimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {v.stock_actual}
                      </span>
                    </td>
                    <td className="px-6 py-4">{v.stock_minimo}</td>
                    <td className="px-6 py-4">{v.stock_maximo || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        v.estado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {v.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}