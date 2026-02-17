const variants = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-200',
  success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200',
  error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variantClass = variants[variant] || variants.primary

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
