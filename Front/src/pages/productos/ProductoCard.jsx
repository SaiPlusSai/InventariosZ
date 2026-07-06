import { Card, Button } from '../../components/ui'
import { formatCurrency } from '../../utils/helpers'

export default function ProductoCard({ 
  producto, 
  color, 
  isPapeleraMode,
  onVer,
  onEditar,
  onEliminar,
  onRecuperar 
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

        {/* Tallas disponibles como chips */}
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-1">Tallas disponibles:</p>
          <div className="flex flex-wrap gap-1">
            {color.variantes.map(v => (
              <span 
                key={v.id} 
                className={`px-2 py-0.5 text-xs rounded border ${
                  v.stock_actual > 0 
                    ? 'border-gray-300 bg-white text-gray-700' 
                    : 'border-red-200 bg-red-50 text-red-400 line-through'
                }`}
              >
                {v.talla.nombre}
              </span>
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
