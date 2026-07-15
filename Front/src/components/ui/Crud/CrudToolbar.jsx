import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import PrimaryActions from './PrimaryActions'
import ActionDropdown from './ActionDropdown'
import SearchInput from './SearchInput'
import FilterButton from './FilterButton'
import FilterPanel from './FilterPanel'
import FilterChip from '../FilterChip'

export default function CrudToolbar({
  title,
  description,
  primaryActions = [],
  secondaryActions = [],
  searchConfig = null,
  filterConfig = null
}) {
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div className="flex justify-between items-center w-full md:w-auto overflow-hidden">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight truncate mr-2">
              {title}
            </h1>
            {description && (
              <p className="hidden sm:block text-gray-500 mt-1 text-sm">
                {description}
              </p>
            )}
          </div>
          
          <button 
            onClick={() => setIsActionsExpanded(!isActionsExpanded)} 
            className="md:hidden px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm flex-shrink-0"
          >
            Menú {isActionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto mt-2 md:mt-0 justify-end transition-all ${isActionsExpanded ? 'max-h-96 opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden md:max-h-96 md:opacity-100 md:overflow-visible'}`}>
          {/* Botones secundarios (como Ver Papelera) ocultos en móvil y movidos al dropdown */}
          <PrimaryActions 
            actions={primaryActions
              .filter(a => a.variant !== 'primary')
              .map(a => ({ ...a, className: `${a.className || ''} hidden sm:inline-flex` }))
            } 
          />
          {/* ActionDropdown con sus propias acciones + las primarias secundarias inyectadas para móvil */}
          <div className="flex-1 sm:flex-none">
            <ActionDropdown actions={[
               ...primaryActions.filter(a => a.variant !== 'primary').map(a => ({ ...a, className: 'flex sm:hidden' })),
               ...secondaryActions
            ]} />
          </div>
          {/* Botón Principal (Nuevo Producto) */}
          <PrimaryActions 
            actions={primaryActions
              .filter(a => a.variant === 'primary')
              .map(a => ({ ...a, className: `${a.className || ''} flex-1 sm:flex-none` }))
            } 
          />
        </div>
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || filterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-0.5 mt-1 md:mt-2">
          <div className="flex flex-row items-center p-0.5 md:p-1 w-full gap-1.5 md:gap-2">
            
            {searchConfig && (
              <SearchInput {...searchConfig} />
            )}
            
            {filterConfig && (
              <FilterButton 
                showFilters={filterConfig.showFilters} 
                onToggle={filterConfig.onToggle} 
              />
            )}
            
          </div>

          {filterConfig && (
            <FilterPanel 
              showFilters={filterConfig.showFilters}
              filters={filterConfig.filters}
              onClear={filterConfig.onClear}
              onApply={filterConfig.onApply}
            />
          )}
        </div>
      )}

      {/* Active Filters Chips */}
      {filterConfig && filterConfig.activeFilters && filterConfig.activeFilters.length > 0 && !filterConfig.showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1 animate-in fade-in duration-200">
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
