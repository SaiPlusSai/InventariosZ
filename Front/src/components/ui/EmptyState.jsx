import { Inbox } from 'lucide-react'
// Fix import because in earlier steps we saw Button was default export.
import Button from './Button'

export function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No hay datos', 
  description = 'No se encontraron registros para mostrar.',
  actionLabel,
  onAction
}) {
  return (
    <div className="w-full bg-white border border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
