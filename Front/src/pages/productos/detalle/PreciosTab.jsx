import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react'

import MetricCard from './MetricCard'

export default function PreciosTab({
  producto,
}) {

  const compra = Number(producto.precio?.precio_compra ?? 0)
  const venta = Number(producto.precio?.precio_venta ?? 0)

  const utilidad = venta - compra

  const margen =
    compra > 0
      ? ((utilidad / compra) * 100).toFixed(1)
      : 0

  return (

    <div className="p-8 space-y-8">

      <div>

        <h2 className="text-3xl font-bold">

          Información de Precios

        </h2>

        <p className="text-gray-500 mt-1">

          Resumen financiero del producto.

        </p>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <MetricCard
          icon={<TrendingDown className="text-red-500" />}
          title="Precio de Compra"
          value={
            compra > 0
              ? `Bs ${compra.toFixed(2)}`
              : '-'
          }
        />

        <MetricCard
          icon={<TrendingUp className="text-green-600" />}
          title="Precio de Venta"
          value={
            venta > 0
              ? `Bs ${venta.toFixed(2)}`
              : '-'
          }
        />

      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        <MetricCard
          icon={<DollarSign className="text-blue-600" />}
          title="Ganancia por Unidad"
          value={`Bs ${utilidad.toFixed(2)}`}
        />

        <MetricCard
          icon={<Percent className="text-orange-500" />}
          title="Margen"
          value={`${margen}%`}
        />

      </div>

      <div className="rounded-xl border bg-slate-50 p-6">

        <h3 className="font-semibold text-lg mb-4">

          Resumen

        </h3>

        <div className="grid md:grid-cols-4 gap-6">

          <div>

            <p className="text-sm text-gray-500">

              Compra

            </p>

            <p className="text-xl font-bold">

              Bs {compra.toFixed(2)}

            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">

              Venta

            </p>

            <p className="text-xl font-bold">

              Bs {venta.toFixed(2)}

            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">

              Utilidad

            </p>

            <p className="text-xl font-bold text-green-600">

              Bs {utilidad.toFixed(2)}

            </p>

          </div>

          <div>

            <p className="text-sm text-gray-500">

              Margen

            </p>

            <p className="text-xl font-bold text-blue-600">

              {margen}%

            </p>

          </div>

        </div>

      </div>

    </div>

  )

}