import React, { useState } from 'react'
import SearchInput from './SearchInput'
import FilterButton from './FilterButton'
import FilterPanelDesktop from './FilterPanelDesktop'
import FilterPanelMobile from './FilterPanelMobile'
import FilterChip from '../FilterChip'
import PageHeader from '../PageHeader'
import ResponsiveHeaderActions from './ResponsiveHeaderActions'

// Helper for local filter configuration
function useLocalFilterConfig(filterConfig) {
  const [showFilters, setShowFilters] = useState(false);
  
  if (!filterConfig) return null;
  
  return {
    ...filterConfig,
    showFilters,
    onToggle: () => setShowFilters(!showFilters),
    onApply: () => {
      if (filterConfig.onApply) filterConfig.onApply();
      setShowFilters(false);
    }
  };
}

// Orquestador Principal
export default function CrudToolbar(props) {
  const { title, description, primaryActions, secondaryActions, searchConfig, filterConfig, sticky = true, stickyOffset = 'top-0' } = props;
  const localFilterConfig = useLocalFilterConfig(filterConfig);

  return (
    <PageHeader isSticky={sticky} stickyOffset={stickyOffset} className="w-auto">
      <div className="flex flex-col gap-2 w-full">
        {/* Title & Actions Row */}
        <div className="flex flex-row justify-between items-center gap-2 w-full flex-none">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight truncate md:overflow-visible md:whitespace-normal mr-2">
              {title}
            </h1>
            {description && (
              <p className="hidden md:block text-gray-500 mt-1 text-sm">{description}</p>
            )}
          </div>
          
          <div className="flex flex-row items-center gap-2 justify-end flex-shrink-0">
            <ResponsiveHeaderActions primaryActions={primaryActions} secondaryActions={secondaryActions} />
          </div>
        </div>

        {/* Search & Filters Row */}
        {(searchConfig || localFilterConfig) && (
          <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-1 mt-1 w-full flex-none">
            <div className="flex flex-row items-center p-1 w-full gap-2">
              {searchConfig && <SearchInput {...searchConfig} />}
              {localFilterConfig && <FilterButton showFilters={localFilterConfig.showFilters} onToggle={localFilterConfig.onToggle} />}
            </div>
            
            {localFilterConfig && (
              <>
                <div className="hidden md:block">
                  <FilterPanelDesktop {...localFilterConfig} />
                </div>
                <div className="md:hidden">
                  <FilterPanelMobile {...localFilterConfig} />
                </div>
              </>
            )}
          </div>
        )}

        {/* Active Filters Chips */}
        {localFilterConfig?.activeFilters?.length > 0 && !localFilterConfig.showFilters && (
          <div className="flex flex-wrap items-center gap-1.5 mt-1 animate-in fade-in duration-200 flex-none w-full">
            {localFilterConfig.activeFilters.map((chip, idx) => (
              <FilterChip key={idx} label={chip.label} value={chip.value} onRemove={() => chip.onRemove()} />
            ))}
            {localFilterConfig.activeFilters.length > 1 && localFilterConfig.onClear && (
              <button 
                onClick={localFilterConfig.onClear}
                className="text-sm text-gray-500 hover:text-primary-600 font-medium ml-1 underline decoration-transparent hover:decoration-primary-600 transition-all focus:outline-none"
              >
                Limpiar todos
              </button>
            )}
          </div>
        )}
      </div>
    </PageHeader>
  )
}
