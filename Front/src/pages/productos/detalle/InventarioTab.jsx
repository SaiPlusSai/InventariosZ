import { Warehouse } from 'lucide-react'

import MetricCard from './MetricCard'
import ProgressStock from './ProgressStock'
import MovimientoModal from '../movimientos/MovimientoModal.jsx'
import KardexTable from '../movimientos/KardexTable.jsx'
import React, { useState } from 'react'
import Button from '../../../components/ui/Button'

export default function InventarioTab({ producto, refreshProducto }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [selectedProductStock, setSelectedProductStock] = useState(0)
  const [showKardexId, setShowKardexId] = useState(null)

  const openModal = (id, stock) => {
    setSelectedProductId(id)
    setSelectedProductStock(stock)
    setIsModalOpen(true)
  }
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

      {(!producto.variantes || producto.variantes.length === 0) && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Kardex (Historial de Movimientos)</h3>
            <Button variant="primary" onClick={() => openModal(producto.id, stockTotal)}>
              Registrar Movimiento
            </Button>
          </div>
          <KardexTable productoId={producto.id} />
        </div>
      )}

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
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {producto.variantes.map((v) => (
                  <React.Fragment key={v.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Button variant="secondary" className="px-3 py-1 text-xs" onClick={() => setShowKardexId(showKardexId === v.id ? null : v.id)}>
                        {showKardexId === v.id ? 'Ocultar Kardex' : 'Kardex'}
                      </Button>
                      <Button variant="primary" className="px-3 py-1 text-xs" onClick={() => openModal(v.id, v.stock_actual)}>
                        Mover Stock
                      </Button>
                    </td>
                  </tr>
                  {showKardexId === v.id && (
                    <tr key={`kardex-${v.id}`}>
                      <td colSpan="7" className="p-4 bg-gray-50 border-t border-gray-100">
                        <KardexTable productoId={v.id} />
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <MovimientoModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productoId={selectedProductId}
        stockActual={selectedProductStock}
        onMovimientoRealizado={() => {
          if(refreshProducto) refreshProducto();
        }}
      />
    </div>
  )
}