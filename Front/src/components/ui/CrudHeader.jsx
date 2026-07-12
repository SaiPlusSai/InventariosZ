import React from 'react'
import { Card, Button } from './index'
import { Search, Filter, ChevronUp, ChevronDown, X } from 'lucide-react'
import FilterChip from './FilterChip'

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
        <Card className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible">
          {(searchConfig || filterConfig) && (
            <div className="flex flex-col md:flex-row items-center p-1">
              {searchConfig && (
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-4 py-2 bg-transparent border-none focus:ring-0 text-gray-700 text-sm placeholder-gray-400"
                    placeholder={searchConfig.placeholder || "Buscar..."}
                    value={searchConfig.value}
                    onChange={(e) => searchConfig.onChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchConfig.onSearch && searchConfig.onSearch()}
                  />
                </div>
              )}
              
              {searchConfig && filterConfig && (
                <div className="hidden md:block w-px h-6 bg-gray-200 mx-2"></div>
              )}

              <div className="flex items-center gap-1 w-full md:w-auto p-1 md:p-0 border-t md:border-t-0 border-gray-100">
                {searchConfig && searchConfig.onClear && (
                  <Button variant="ghost" onClick={searchConfig.onClear} className="flex-1 md:flex-none text-sm px-3 py-1.5 h-auto text-gray-600 hover:text-gray-900">
                    Limpiar
                  </Button>
                )}
                
                {searchConfig && searchConfig.onSearch && !searchConfig.hideSearchButton && (
                  <Button variant="primary" onClick={searchConfig.onSearch} className="flex-1 md:flex-none text-sm px-4 py-1.5 h-auto shadow-sm">
                    Buscar
                  </Button>
                )}
                
                {filterConfig && (
                  <Button 
                    variant={filterConfig.showFilters ? "secondary" : "ghost"}
                    onClick={filterConfig.onToggle}
                    className={`flex-1 md:flex-none text-sm px-3 py-1.5 h-auto ml-1 ${filterConfig.showFilters ? 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100' : 'text-gray-600'}`}
                  >
                    <Filter size={14} className="mr-1.5" />
                    <span>Filtros</span>
                    {filterConfig.showFilters ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Filter Panel */}
          {filterConfig && (
            <div className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${filterConfig.showFilters ? 'max-h-[1000px] opacity-100 border-t border-gray-100 bg-gray-50/50' : 'max-h-0 opacity-0'}`}>
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {filterConfig.filters}
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-5 pt-4 border-t border-gray-200/60">
                  <Button variant="secondary" className="w-full sm:w-auto text-sm py-1.5" onClick={filterConfig.onClear}>
                    Limpiar Filtros
                  </Button>
                  <Button variant="primary" className="w-full sm:w-auto text-sm py-1.5" onClick={filterConfig.onApply}>
                    <Search size={14} className="mr-1.5"/> Aplicar Filtros
                  </Button>
                </div>
              </div>
            </div>
          )}

          {extraContent}
        </Card>
      )}

      {/* Active Filters Chips */}
      {filterConfig && filterConfig.activeFilters && filterConfig.activeFilters.length > 0 && !filterConfig.showFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {filterConfig.activeFilters.map((chip, idx) => (
            <FilterChip 
              key={idx} 
              label={chip.label} 
              value={chip.value} 
              onRemove={() => chip.onRemove()} 
            />
          ))}
          {filterConfig.activeFilters.length > 1 && filterConfig.onClear && (
            <button 
              onClick={filterConfig.onClear}
              className="text-sm text-gray-500 hover:text-primary-600 font-medium ml-1 underline decoration-transparent hover:decoration-primary-600 transition-all focus:outline-none"
            >
              Limpiar todos
            </button>
          )}
        </div>
      )}
    </div>
  )
}
