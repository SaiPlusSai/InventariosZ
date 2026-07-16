import { Card, Button } from '../../components/ui'
import { ExpandableInventory } from '../../components/ui/ExpandableInventory'
import { formatCurrency } from '../../utils/helpers'

export default function ProductoCard({ 
  producto, 
  color, 
  isPapeleraMode,
  onVer,
  onEditar,
  onCompartir,
  onEliminar,
  onRecuperar,
  onIncrementar,
  onDecrementar,
  isSelected = false,
  onToggleSelection
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
    <div className="relative group w-full max-w-[360px] mx-auto">
      <Card 
        className={`relative hover:shadow-lg transition-all flex flex-col h-full w-full ${
          isSelected ? 'ring-2 ring-primary-500 bg-primary-50/10' : ''
        }`}
      >
        {/* Checkbox de Selección */}
        {onToggleSelection && (
          <div 
            className={`absolute top-2 left-2 z-20 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => {}} // Handle on parent div click
              className="w-5 h-5 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-white shadow-sm"
            />
          </div>
        )}
        
        {/* Imagen */}
        <div className="w-full aspect-[4/3] max-h-[220px] bg-white border-b border-gray-100 mb-3 flex items-center justify-center overflow-hidden">
        {color.imagen_principal ? (
          <img
            src={color.imagen_principal}
            alt={`${producto.descripcion || producto.codigo} - ${color.color.nombre}`}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>

      <div className="space-y-1.5 px-3 mb-3 flex flex-col grow">
        <p className="text-sm text-gray-600 font-medium">
          {producto.marca?.nombre}
        </p>

        <h3 className="font-semibold text-lg leading-tight">
          {producto.descripcion || producto.codigo}
        </h3>

        <div className="text-[13px] text-gray-500 space-y-0.5">
          <p>Código: <span className="font-medium">{producto.codigo}</span></p>
          <p>Material: {producto.material?.nombre}</p>
          <p className="text-primary-600 font-medium">Color: {color.color.nombre}</p>
        </div>

        {/* Tallas disponibles con controles de stock */}
        <ExpandableInventory 
          variantes={color.variantes} 
          onIncrementar={onIncrementar} 
          onDecrementar={onDecrementar} 
        />
      </div>

      {/* Info footer: Stock & Precios */}
      <div className="grid grid-cols-2 gap-2 mx-3 mb-3 p-2.5 bg-gray-50 rounded-lg">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Stock Total</p>
          <p className={`font-bold text-[13px] ${stockTotal > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {stockTotal} unid.
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Precio</p>
          <p className="font-bold text-[13px] text-gray-800">
            {precioDisplay}
          </p>
        </div>
      </div>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-1 mt-auto px-3 pb-3">
        {!isPapeleraMode ? (
          <>
            <Button variant="ghost" className="text-xs w-full py-1.5 h-8 shrink-0" onClick={() => onVer(color.color_id)}>
              Ver
            </Button>
            <Button variant="ghost" className="text-xs w-full py-1.5 h-8 shrink-0" onClick={() => onCompartir && onCompartir()}>
              Compartir
            </Button>
            <Button variant="secondary" className="text-xs w-full py-1.5 h-8 shrink-0" onClick={() => onEditar()}>
              Editar
            </Button>
            <Button variant="secondary" className="text-red-600 border-red-200 hover:bg-red-50 text-xs w-full py-1.5 h-8 shrink-0" onClick={() => onEliminar()}>
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
    </div>
  )
}
