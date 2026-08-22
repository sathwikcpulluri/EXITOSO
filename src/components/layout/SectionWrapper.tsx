import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SectionWrapperProps {
  children: ReactNode
  className?: string
}

export function SectionWrapper({ children, className }: SectionWrapperProps) {
  return (
    <div className={cn('max-w-7xl mx-auto', className)}>
      {children}
    </div>
  )
}
