import React from 'react'
import { Search } from 'lucide-react'
import Button from '../Button'

export default function FilterPanelMobile({ showFilters, filters, onClear, onApply, onToggle }) {
  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onToggle}
      />
      
      {/* Panel container */}
      <div className={`
        fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)]
        transform transition-transform duration-300 ease-out
        ${showFilters ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div>
          {/* Bottom sheet pill indicator */}
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-4 mb-2" />
          
          <div className="p-4">
            <div className="grid grid-cols-1 gap-3">
              {filters}
            </div>
            <div className="flex flex-col justify-end gap-2 mt-5 pt-4 border-t border-gray-200/60">
              {onClear && (
                <Button variant="secondary" className="w-full text-sm py-2.5" onClick={onClear}>
                  Limpiar Filtros
                </Button>
              )}
              {onApply && (
                <Button variant="primary" className="w-full text-sm py-2.5" onClick={onApply}>
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
