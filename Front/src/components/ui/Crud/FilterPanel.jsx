import React from 'react'
import { Search } from 'lucide-react'
import Button from '../Button'

export default function FilterPanel({ showFilters, filters, onClear, onApply }) {
  return (
    <div className={`transition-all duration-200 ease-in-out origin-top overflow-hidden ${showFilters ? 'max-h-[1000px] opacity-100 border-t border-gray-100 bg-gray-50/50' : 'max-h-0 opacity-0'}`}>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {filters}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-3 pt-3 border-t border-gray-200/60">
          {onClear && (
            <Button variant="secondary" className="inline-flex items-center justify-center whitespace-nowrap w-full sm:w-auto text-sm py-1" onClick={onClear}>
              Limpiar Filtros
            </Button>
          )}
          {onApply && (
            <Button variant="primary" className="inline-flex items-center justify-center whitespace-nowrap w-full sm:w-auto text-sm py-1" onClick={onApply}>
              <Search size={14} className="mr-1.5"/> Aplicar Filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
