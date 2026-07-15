import React from 'react'
import { Search } from 'lucide-react'
import Button from '../Button'

export default function FilterPanel({ showFilters, filters, onClear, onApply, onToggle }) {
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity md:hidden ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onToggle}
      />
      
      {/* Panel container */}
      <div className={`
        /* Mobile: Bottom Sheet */
        fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]
        transform transition-transform duration-300 ease-out md:hidden
        ${showFilters ? 'translate-y-0' : 'translate-y-full'}
        
        /* Desktop: Inline Accordion using Grid */
        md:relative md:inset-auto md:z-auto md:bg-gray-50/50 md:rounded-none md:shadow-none md:transform-none 
        md:grid md:transition-all md:duration-300 md:ease-in-out
        ${showFilters ? 'md:grid-rows-[1fr] md:opacity-100 md:border-t md:border-gray-100' : 'md:grid-rows-[0fr] md:opacity-0 md:border-t-0 md:border-transparent'}
      `}>
        <div className="md:overflow-hidden">
          {/* Bottom sheet pill indicator */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2 md:hidden" />
          
          <div className="p-4 md:p-3 lg:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-2">
              {filters}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5 md:mt-3 pt-4 md:pt-3 border-t border-gray-200/60">
              {onClear && (
                <Button variant="secondary" className="w-full sm:w-auto text-sm py-2.5 md:py-1" onClick={onClear}>
                  Limpiar Filtros
                </Button>
              )}
              {onApply && (
                <Button variant="primary" className="w-full sm:w-auto text-sm py-2.5 md:py-1" onClick={onApply}>
                  <Search size={14} className="mr-1.5"/> Aplicar Filtros
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
