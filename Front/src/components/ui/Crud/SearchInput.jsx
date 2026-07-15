import React from 'react'
import { Search } from 'lucide-react'
import Button from '../Button'

export default function SearchInput({ 
  value = '', 
  onChange, 
  onSearch, 
  onClear, 
  placeholder = 'Buscar...', 
  hideSearchButton = false 
}) {
  return (
    <div className="flex-1 w-full md:w-[70%]">
      <div className="flex flex-col md:flex-row items-center">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-4 py-1.5 bg-transparent border-none focus:ring-0 text-gray-700 text-sm placeholder-gray-400"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch && onSearch()}
          />
        </div>

        {(onClear || (onSearch && !hideSearchButton)) && (
          <div className="flex items-center gap-1 w-full md:w-auto p-1 md:p-0 border-t md:border-t-0 border-gray-100">
            {onClear && (
              <Button variant="ghost" onClick={onClear} className="inline-flex items-center justify-center whitespace-nowrap flex-1 md:flex-none text-sm px-3 py-1 h-auto text-gray-600 hover:text-gray-900">
                Limpiar
              </Button>
            )}
            
            {onSearch && !hideSearchButton && (
              <Button variant="primary" onClick={onSearch} className="inline-flex items-center justify-center whitespace-nowrap flex-1 md:flex-none text-sm px-4 py-1 h-auto shadow-sm">
                Buscar
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
