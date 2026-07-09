import { Card, Button } from '../../components/ui'
import { formatCurrency } from '../../utils/helpers'

export default function ProductoCard({ 
  producto, 
  color, 
  isPapeleraMode,
  onVer,
  onEditar,
  onEliminar,
  onRecuperar,
  onIncrementar,
  onDecrementar 
}) {
  // Calculamos stock total y rango de precios
  const stockTotal = color.variantes.reduce((sum, v) => sum + v.stock_actual, 0)
  
  const precios = color.variantes.map(v => v.precio_venta)
  const precioMin = Math.min(...precios)
  const precioMax = Math.max(...precios)

  const precioDisplay = precios.length > 0
    ? (precioMin === precioMax 
        ? formatCurrency(precioMin) 
        : `Desde ${formatCurrency(precioMin)}`)
    : 'No definido'

  return (
    <Card className="hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Imagen */}
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
        {color.imagen_principal ? (
          <img
            src={color.imagen_principal}
            alt={`${producto.descripcion || producto.codigo} - ${color.color.nombre}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>

      <div className="flex-1 space-y-2 mb-4">
        <p className="text-sm text-gray-600 font-medium">
          {producto.marca?.nombre}
        </p>

        <h3 className="font-semibold text-lg leading-tight">
          {producto.descripcion || producto.codigo}
        </h3>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Código: <span className="font-medium">{producto.codigo}</span></p>
          <p>Material: {producto.material?.nombre}</p>
          <p className="text-primary-600 font-medium">Color: {color.color.nombre}</p>
        </div>

        {/* Tallas disponibles con controles de stock */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Inventario por talla:</p>
          <div className="space-y-2">
            {color.variantes.map(v => (
              <div key={v.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                  {v.talla.nombre}
                </span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    className="h-6 w-6 p-0 min-w-0 flex items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onDecrementar && onDecrementar(v.id)}
                    disabled={v.stock_actual <= 0}
                  >
                    -
                  </Button>
                  <span className={`text-sm font-bold w-6 text-center ${v.stock_actual > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {v.stock_actual}
                  </span>
                  <Button
                    variant="secondary"
                    className="h-6 w-6 p-0 min-w-0 flex items-center justify-center rounded-md"
                    onClick={() => onIncrementar && onIncrementar(v.id)}
                  >
                    +
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info footer: Stock & Precios */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-500">Stock Total</p>
          <p className={`font-bold ${stockTotal > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {stockTotal} unid.
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Precio</p>
          <p className="font-bold text-gray-800">
            {precioDisplay}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2 mt-auto">
        {!isPapeleraMode ? (
          <>
            <Button variant="ghost" className="flex-1 text-xs" onClick={() => onVer(color.color_id)}>
              Ver
            </Button>
            <Button variant="secondary" className="flex-1 text-xs" onClick={() => onEditar()}>
              Editar
            </Button>
            {/* Opcional: Eliminar todo el producto (no solo la variante). Ajustar si es necesario */}
            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 flex-1 text-xs" onClick={() => onEliminar()}>
              Eliminar
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" className="text-green-600 border-green-200 hover:bg-green-50 flex-1 text-xs" onClick={() => onRecuperar()}>
              Recuperar
            </Button>
            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 flex-1 text-xs" onClick={() => onEliminar()}>
              Elim. Definitivo
            </Button>
          </>
        )}
      </div>
    </Card>
  )
}
