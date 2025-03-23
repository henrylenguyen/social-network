import React, { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // Base classes
  let classes =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'

  // Variant classes
  switch (variant) {
    case 'primary':
      classes += ' bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      break
    case 'secondary':
      classes += ' bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
      break
    case 'outline':
      classes +=
        ' border border-gray-300 bg-transparent text-gray-900 hover:bg-gray-50 focus:ring-gray-500'
      break
    case 'ghost':
      classes += ' bg-transparent text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
      break
    case 'danger':
      classes += ' bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
      break
  }

  // Size classes
  switch (size) {
    case 'sm':
      classes += ' text-xs h-8 px-3'
      break
    case 'md':
      classes += ' text-sm h-10 px-4'
      break
    case 'lg':
      classes += ' text-base h-12 px-6'
      break
  }

  // Width class
  if (fullWidth) {
    classes += ' w-full'
  }

  // Disabled state
  if (disabled || isLoading) {
    classes += ' opacity-50 cursor-not-allowed'
  }

  // Add custom classes
  classes += ` ${className}`

  return (
    <button type="button" className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg
          className="-ml-1 mr-2 h-4 w-4 animate-spin text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  )
}
