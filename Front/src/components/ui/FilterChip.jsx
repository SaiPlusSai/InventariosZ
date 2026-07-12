import React from 'react'
import { X } from 'lucide-react'

export default function FilterChip({ label, value, onRemove }) {
  if (!value) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm text-sm text-gray-700">
      <span className="font-medium text-gray-900">{label}:</span>
      <span className="truncate max-w-[150px]" title={value}>{value}</span>
      <button 
        onClick={onRemove}
        className="ml-1 text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-0.5 hover:bg-red-50 transition-colors"
        aria-label={`Quitar filtro ${label}`}
      >
        <X size={14} />
      </button>
    </div>
  )
}
