import React from 'react'
import { Card, Button } from './index'
import { Search, Filter, ChevronUp, ChevronDown } from 'lucide-react'

export default function CrudHeader({
  title,
  description,
  actions = [],
  searchConfig = null,
  filterConfig = null,
  extraContent = null
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
            {actions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button 
                  key={index}
                  variant={action.variant || 'secondary'} 
                  onClick={action.onClick}
                  className={`w-full sm:w-auto ${action.className || ''}`}
                  title={action.title}
                >
                  {Icon && <Icon size={16} className="mr-2 inline" />}
                  {action.label}
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || filterConfig || extraContent) && (
        <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-hidden">
          {(searchConfig || filterConfig) && (
            <div className="flex flex-col md:flex-row items-stretch md:items-center">
              {searchConfig && (
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-11 pr-4 py-3.5 bg-transparent border-none focus:ring-0 text-gray-700 text-base"
                    placeholder={searchConfig.placeholder || "Buscar..."}
                    value={searchConfig.value}
                    onChange={(e) => searchConfig.onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchConfig.onSearch && searchConfig.onSearch()}
                  />
                </div>
              )}
              
              {searchConfig && filterConfig && (
                <div className="hidden md:block w-px h-8 bg-gray-200 mx-2"></div>
              )}

              {filterConfig && (
                <button 
                  onClick={filterConfig.onToggle}
                  className={`flex items-center justify-center gap-2 px-6 py-3.5 font-medium transition-colors md:w-auto w-full md:border-none border-t border-gray-100 focus:outline-none ${filterConfig.showFilters ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Filter size={18} />
                  <span>Filtros</span>
                  {filterConfig.showFilters ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
                </button>
              )}
              
              {/* Extra button if searchConfig is standalone and wants a trigger button */}
              {searchConfig && searchConfig.onSearch && !searchConfig.hideSearchButton && !filterConfig && (
                <div className="p-2 border-t md:border-t-0 border-gray-100 flex gap-2">
                  {searchConfig.onClear && (
                    <Button variant="secondary" onClick={searchConfig.onClear} className="w-full md:w-auto justify-center">
                      Limpiar
                    </Button>
                  )}
                  <Button variant="primary" onClick={searchConfig.onSearch} className="w-full md:w-auto justify-center">
                    Buscar
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Filter Panel */}
          {filterConfig && (
            <div className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${filterConfig.showFilters ? 'max-h-[1000px] opacity-100 border-t border-gray-100 bg-gray-50/50' : 'max-h-0 opacity-0'}`}>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {filterConfig.filters}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                  <Button variant="secondary" className="w-full sm:w-auto" onClick={filterConfig.onClear}>
                    Limpiar
                  </Button>
                  <Button variant="primary" className="w-full sm:w-auto" onClick={filterConfig.onApply}>
                    <Search size={16} className="mr-2"/> Buscar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {extraContent}
        </Card>
      )}
    </div>
  )
}
