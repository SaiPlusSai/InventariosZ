import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import Button from './Button' // Use the same UI Button

export function ExpandableInventory({ variantes, onIncrementar, onDecrementar }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-3">
      <div 
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`p-1 rounded bg-gray-100 text-gray-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600`}>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        <p className="text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors select-none">
          {isOpen ? 'Ocultar tallas' : 'Ver tallas'}
        </p>
      </div>

      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'
        }`}
      >
        <div className="overflow-hidden space-y-2">
          {variantes.map(v => (
            <div key={v.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
              <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
                {v.talla.nombre}
              </span>
              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="h-6 w-6 p-0 min-w-0 flex items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => onDecrementar && onDecrementar(v.id, v.stock_actual)}
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
                  onClick={() => onIncrementar && onIncrementar(v.id, v.stock_actual)}
                >
                  +
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
