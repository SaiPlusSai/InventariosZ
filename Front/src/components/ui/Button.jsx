export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  const baseStyles = 'font-medium rounded-lg transition-colors focus:outline-none'
  
  const variants = {
    primary: disabled
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: disabled
      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
      : 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: disabled
      ? 'bg-red-300 text-red-700 cursor-not-allowed'
      : 'bg-red-600 text-white hover:bg-red-700',
    ghost: disabled
      ? 'text-gray-400 cursor-not-allowed'
      : 'text-gray-700 hover:bg-gray-100',
  }
  
  const sizes = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
