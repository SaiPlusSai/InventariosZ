import { Warehouse } from 'lucide-react'

import MetricCard from './MetricCard'
import ProgressStock from './ProgressStock'

export default function InventarioTab({
  producto,
}) {

  return (

    <div className="p-8">

      <h2 className="text-2xl font-bold mb-8">

        Inventario

      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <MetricCard
          icon={<Warehouse />}
          title="Stock Actual"
          value={producto.stock_actual}
        />

        <MetricCard
          icon={<Warehouse />}
          title="Stock Mínimo"
          value={producto.stock_minimo}
        />

        <MetricCard
          icon={<Warehouse />}
          title="Stock Máximo"
          value={producto.stock_maximo ?? '-'}
        />

      </div>

      <ProgressStock
        actual={producto.stock_actual}
        minimo={producto.stock_minimo}
        maximo={producto.stock_maximo}
      />

    </div>

  )

}