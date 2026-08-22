import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'none'
  hover?: boolean
  bordered?: boolean
  glass?: boolean
}

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export function Card({ children, className, padding = 'md', hover = false, bordered = false, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl',
        glass ? 'glass' : 'bg-white shadow-card',
        bordered && 'border border-surface-200',
        hover && 'transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-surface-900', className)}>
      {children}
    </h3>
  )
}
