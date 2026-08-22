import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantStyles: Record<string, string> = {
  primary:
    'btn-futuristic bg-black text-white font-bold hover:shadow-[0_0_24px_rgba(230,0,122,0.45)] active:scale-[0.98]',
  secondary:
    'bg-surface-900 text-white font-semibold hover:bg-surface-800 border border-surface-700 shadow-sm active:scale-[0.98]',
  ghost:
    'text-surface-700 hover:bg-surface-100 hover:text-surface-900 font-semibold active:scale-[0.98]',
  danger:
    'btn-futuristic-danger bg-black text-white font-bold hover:shadow-[0_0_20px_rgba(239,68,68,0.45)] active:scale-[0.98]',
  outline:
    'btn-futuristic-outline text-surface-900 font-bold hover:bg-black hover:text-white active:scale-[0.98]',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-3.5 py-1.5 text-xs gap-1.5 rounded-xl',
  md: 'px-5 py-2.5 text-sm gap-2 rounded-2xl',
  lg: 'px-7 py-3.5 text-base gap-2.5 rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none tracking-wide select-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" className="mr-2 text-white" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !loading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
