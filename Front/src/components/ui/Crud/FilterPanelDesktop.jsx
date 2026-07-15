import React from 'react'
import { Search } from 'lucide-react'
import Button from '../Button'

export default function FilterPanelDesktop({ showFilters, filters, onClear, onApply }) {
  return (
    <div className={`
      relative inset-auto z-auto bg-gray-50/50 rounded-none shadow-none transform-none 
      grid transition-all duration-300 ease-in-out
      ${showFilters ? 'grid-rows-[1fr] opacity-100 border-t border-gray-100' : 'grid-rows-[0fr] opacity-0 border-t-0 border-transparent'}
    `}>
      <div className="overflow-hidden min-h-0">
        <div className="p-3 lg:p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {filters}
          </div>
          <div className="flex flex-row justify-end gap-2 mt-3 pt-3 border-t border-gray-200/60">
            {onClear && (
              <Button variant="secondary" className="w-auto text-sm py-1" onClick={onClear}>
                Limpiar Filtros
              </Button>
            )}
            {onApply && (
              <Button variant="primary" className="w-auto text-sm py-1" onClick={onApply}>
                <Search size={14} className="mr-1.5"/> Aplicar Filtros
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
