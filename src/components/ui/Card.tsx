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

export function Card({ children, className, padding = 'md', hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-neutral-900/80 backdrop-blur-2xl border border-white/10 text-white shadow-[0_15px_35px_rgba(0,0,0,0.4)]',
        hover && 'transition-all duration-300 hover:border-white/25 hover:shadow-[0_20px_45px_rgba(0,0,0,0.6)] hover:-translate-y-0.5 cursor-pointer',
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
    <h3 className={cn('text-base sm:text-lg font-bold text-white tracking-tight', className)}>
      {children}
    </h3>
  )
}
