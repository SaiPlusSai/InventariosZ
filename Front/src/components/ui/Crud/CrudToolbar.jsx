import React from 'react'
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
  return (
    <div className="flex flex-col gap-2">
      {/* Title & Actions Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-gray-500 mt-1 text-sm">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
          <PrimaryActions actions={primaryActions.filter(a => a.variant !== 'primary')} />
          <ActionDropdown actions={secondaryActions} />
          <PrimaryActions actions={primaryActions.filter(a => a.variant === 'primary')} />
        </div>
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || filterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-0.5 mt-2">
          <div className="flex flex-col md:flex-row items-center p-1">
            
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
        <div className="flex flex-wrap items-center gap-2 mt-1 animate-in fade-in duration-200">
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
