import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import PrimaryActions from './PrimaryActions'
import ActionDropdown from './ActionDropdown'
import SearchInput from './SearchInput'
import FilterButton from './FilterButton'
import FilterPanel from './FilterPanel'
import FilterChip from '../FilterChip'

// 1. HeaderDesktop (Resoluciones lg: 1024px+)
function HeaderDesktop({ title, description, primaryActions, secondaryActions, searchConfig, filterConfig }) {
  return (
    <div className="hidden lg:flex flex-col gap-2 w-full">
      {/* Title & Actions Row */}
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-1 text-sm">{description}</p>
          )}
        </div>
        
        <div className="flex flex-row items-center gap-2 justify-end">
          <PrimaryActions actions={primaryActions.filter(a => a.variant !== 'primary')} />
          <ActionDropdown actions={secondaryActions} />
          <PrimaryActions actions={primaryActions.filter(a => a.variant === 'primary')} />
        </div>
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || filterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-1 mt-2">
          <div className="flex flex-row items-center p-1 w-full gap-2">
            {searchConfig && <SearchInput {...searchConfig} />}
            {filterConfig && <FilterButton showFilters={filterConfig.showFilters} onToggle={filterConfig.onToggle} />}
          </div>
          {filterConfig && <FilterPanel {...filterConfig} />}
        </div>
      )}

      {/* Active Filters Chips */}
      {filterConfig?.activeFilters?.length > 0 && !filterConfig.showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1 animate-in fade-in duration-200">
          {filterConfig.activeFilters.map((chip, idx) => (
            <FilterChip key={idx} label={chip.label} value={chip.value} onRemove={() => chip.onRemove()} />
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

// 2. HeaderTablet (Resoluciones md: 768px - 1023px)
function HeaderTablet({ title, primaryActions, secondaryActions, searchConfig, filterConfig }) {
  return (
    <div className="hidden md:flex lg:hidden flex-col gap-2 w-full">
      {/* Title & Actions Row */}
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex-1 min-w-0">
          {/* El título preserva todo el ancho, la descripción se oculta */}
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight truncate mr-2">{title}</h1>
        </div>
        
        {/* Las acciones principales se mantienen visibles en línea */}
        <div className="flex flex-row items-center gap-2 justify-end flex-shrink-0">
          <PrimaryActions actions={primaryActions.filter(a => a.variant !== 'primary')} />
          <ActionDropdown actions={secondaryActions} />
          <PrimaryActions actions={primaryActions.filter(a => a.variant === 'primary')} />
        </div>
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || filterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-1 mt-1">
          <div className="flex flex-row items-center p-1 w-full gap-2">
            {searchConfig && <SearchInput {...searchConfig} />}
            {filterConfig && <FilterButton showFilters={filterConfig.showFilters} onToggle={filterConfig.onToggle} />}
          </div>
          {filterConfig && <FilterPanel {...filterConfig} />}
        </div>
      )}

      {/* Active Filters Chips */}
      {filterConfig?.activeFilters?.length > 0 && !filterConfig.showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1 animate-in fade-in duration-200">
          {filterConfig.activeFilters.map((chip, idx) => (
            <FilterChip key={idx} label={chip.label} value={chip.value} onRemove={() => chip.onRemove()} />
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

// 3. HeaderMobile (Resoluciones < md: menores a 768px)
function HeaderMobile({ title, primaryActions, secondaryActions, searchConfig, filterConfig }) {
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);

  return (
    <div className="flex md:hidden flex-col gap-1.5 w-full">
      {/* Title & Menú Row */}
      <div className="flex flex-row justify-between items-center gap-2">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight truncate mr-2">{title}</h1>
        </div>
        
        <button 
          onClick={() => setIsActionsExpanded(!isActionsExpanded)} 
          className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1.5 text-sm font-medium shadow-sm flex-shrink-0"
        >
          Menú {isActionsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Mobile Actions Dropdown Row */}
      <div className={`flex flex-row items-stretch gap-2 w-full justify-end transition-all overflow-hidden ${isActionsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        {/* Acciones Agrupadas (Ver Papelera + Secundarias) - 40% ancho */}
        <div className="w-[40%] flex-none">
          <ActionDropdown actions={[
             ...primaryActions.filter(a => a.variant !== 'primary').map(a => ({ ...a, className: 'flex' })),
             ...secondaryActions
          ]} />
        </div>
        
        {/* Acción Principal (Nuevo Producto) - 60% ancho */}
        <PrimaryActions 
          actions={primaryActions
            .filter(a => a.variant === 'primary')
            .map(a => ({ ...a, className: `${a.className || ''} w-[60%] flex-none` }))
          } 
        />
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || filterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-0.5 mt-1">
          <div className="flex flex-row items-center p-0.5 w-full gap-1.5">
            {searchConfig && <SearchInput {...searchConfig} />}
            {filterConfig && <FilterButton showFilters={filterConfig.showFilters} onToggle={filterConfig.onToggle} />}
          </div>
          {filterConfig && <FilterPanel {...filterConfig} />}
        </div>
      )}

      {/* Active Filters Chips */}
      {filterConfig?.activeFilters?.length > 0 && !filterConfig.showFilters && (
        <div className="flex flex-wrap items-center gap-1.5 mt-1 animate-in fade-in duration-200">
          {filterConfig.activeFilters.map((chip, idx) => (
            <FilterChip key={idx} label={chip.label} value={chip.value} onRemove={() => chip.onRemove()} />
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

// Orquestador Principal
export default function CrudToolbar(props) {
  return (
    <>
      <HeaderDesktop {...props} />
      <HeaderTablet {...props} />
      <HeaderMobile {...props} />
    </>
  )
}
