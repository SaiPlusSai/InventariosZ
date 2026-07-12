import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import Button from '../Button'

export default function ActionDropdown({ actions = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!actions || actions.length === 0) return null

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center whitespace-nowrap"
      >
        Acciones <ChevronDown size={14} className={`ml-1.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <div 
        className={`absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out z-50 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        <div className="py-1">
          {actions.map((action, idx) => {
            const Icon = action.icon
            return (
              <button
                key={idx}
                onClick={() => {
                  setIsOpen(false)
                  if (action.onClick) action.onClick()
                }}
                className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {Icon && <Icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />}
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
