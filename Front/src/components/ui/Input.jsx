export default function Input({
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 text-red-900' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      <span className={`text-sm mt-1 block h-5 ${error ? 'text-red-500 visible' : 'invisible'}`}>
        {error || 'Espacio reservado'}
      </span>
    </div>
  )
}
