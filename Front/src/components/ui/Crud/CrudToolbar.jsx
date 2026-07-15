import React, { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import PrimaryActions from './PrimaryActions'
import ActionDropdown from './ActionDropdown'
import SearchInput from './SearchInput'
import FilterButton from './FilterButton'
import FilterPanelDesktop from './FilterPanelDesktop'
import FilterPanelMobile from './FilterPanelMobile'
import FilterChip from '../FilterChip'
import { useBreakpoints } from '../../../hooks/useMediaQuery'

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

// 1. HeaderDesktop (Resoluciones lg: 1024px+)
function HeaderDesktop({ title, description, primaryActions, secondaryActions, searchConfig, filterConfig }) {
  const localFilterConfig = useLocalFilterConfig(filterConfig);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Title & Actions Row */}
      <div className="flex flex-row justify-between items-center gap-2 w-full flex-none">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-1 text-sm">{description}</p>
          )}
        </div>
        
        <div className="flex flex-row items-center gap-2 justify-end flex-shrink-0">
          <PrimaryActions actions={primaryActions.filter(a => a.variant !== 'primary')} />
          <ActionDropdown actions={secondaryActions} />
          <PrimaryActions actions={primaryActions.filter(a => a.variant === 'primary')} />
        </div>
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || localFilterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-1 mt-2 w-full flex-none">
          <div className="flex flex-row items-center p-1 w-full gap-2">
            {searchConfig && <SearchInput {...searchConfig} />}
            {localFilterConfig && <FilterButton showFilters={localFilterConfig.showFilters} onToggle={localFilterConfig.onToggle} />}
          </div>
          {localFilterConfig && <FilterPanelDesktop {...localFilterConfig} />}
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
  )
}

// 2. HeaderTablet (Resoluciones md: 768px - 1023px)
function HeaderTablet({ title, primaryActions, secondaryActions, searchConfig, filterConfig }) {
  const localFilterConfig = useLocalFilterConfig(filterConfig);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Title & Actions Row */}
      <div className="flex flex-row justify-between items-center gap-2 w-full flex-none">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight truncate mr-2">{title}</h1>
        </div>
        
        <div className="flex flex-row items-center gap-2 justify-end flex-shrink-0">
          <PrimaryActions actions={primaryActions.filter(a => a.variant !== 'primary')} />
          <ActionDropdown actions={secondaryActions} />
          <PrimaryActions actions={primaryActions.filter(a => a.variant === 'primary')} />
        </div>
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || localFilterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-1 mt-1 w-full flex-none">
          <div className="flex flex-row items-center p-1 w-full gap-2">
            {searchConfig && <SearchInput {...searchConfig} />}
            {localFilterConfig && <FilterButton showFilters={localFilterConfig.showFilters} onToggle={localFilterConfig.onToggle} />}
          </div>
          {localFilterConfig && <FilterPanelDesktop {...localFilterConfig} />}
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
  )
}

// 3. HeaderMobile (Resoluciones < md: menores a 768px)
function HeaderMobile({ title, primaryActions, secondaryActions, searchConfig, filterConfig }) {
  const [isActionsExpanded, setIsActionsExpanded] = useState(false);
  const localFilterConfig = useLocalFilterConfig(filterConfig);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {/* Title & Menú Row */}
      <div className="flex flex-row justify-between items-center gap-2 w-full flex-none">
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
      <div className={`flex flex-row items-stretch gap-2 w-full flex-none justify-end transition-all overflow-hidden ${isActionsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="w-[40%] flex-none">
          <ActionDropdown actions={[
             ...primaryActions.filter(a => a.variant !== 'primary').map(a => ({ ...a, className: 'flex' })),
             ...secondaryActions
          ]} />
        </div>
        
        <PrimaryActions 
          actions={primaryActions
            .filter(a => a.variant === 'primary')
            .map(a => ({ ...a, className: `${a.className || ''} w-[60%] flex-none` }))
          } 
        />
      </div>

      {/* Search & Filters Row */}
      {(searchConfig || localFilterConfig) && (
        <div className="border border-gray-200 shadow-sm bg-white rounded-xl overflow-visible p-0.5 mt-1 w-full flex-none">
          <div className="flex flex-row items-center p-0.5 w-full gap-1.5">
            {searchConfig && <SearchInput {...searchConfig} />}
            {localFilterConfig && <FilterButton showFilters={localFilterConfig.showFilters} onToggle={localFilterConfig.onToggle} />}
          </div>
          {localFilterConfig && <FilterPanelMobile {...localFilterConfig} />}
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
  )
}

// Orquestador Principal
export default function CrudToolbar(props) {
  const { isDesktop, isTablet } = useBreakpoints();

  return (
    <div className="w-auto flex flex-col">
      {isDesktop && <HeaderDesktop {...props} />}
      {isTablet && <HeaderTablet {...props} />}
      {(!isDesktop && !isTablet) && <HeaderMobile {...props} />}
    </div>
  )
}
