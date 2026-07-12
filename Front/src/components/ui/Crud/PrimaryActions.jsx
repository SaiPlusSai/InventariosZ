import React from 'react'
import Button from '../Button'

export default function PrimaryActions({ actions = [] }) {
  if (!actions || actions.length === 0) return null

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Button 
            key={index}
            variant={action.variant || 'primary'} 
            onClick={action.onClick}
            className={`inline-flex items-center justify-center whitespace-nowrap w-full sm:w-auto ${action.className || ''}`}
            title={action.title}
          >
            {Icon && <Icon size={16} className="mr-2 inline" />}
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
