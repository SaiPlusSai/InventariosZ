import React from 'react'
import { Filter, ChevronUp, ChevronDown } from 'lucide-react'
import Button from '../Button'

export default function FilterButton({ showFilters, onToggle }) {
  return (
    <div className="flex items-center pl-2 ml-2 border-l border-gray-200">
      <Button 
        variant={showFilters ? "secondary" : "ghost"}
        onClick={onToggle}
        className={`inline-flex items-center justify-center whitespace-nowrap text-sm px-3 py-1 h-auto ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-100 hover:bg-primary-100' : 'text-gray-600'}`}
      >
        <Filter size={14} className="mr-1.5" />
        <span>Filtros</span>
        {showFilters ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
      </Button>
    </div>
  )
}
