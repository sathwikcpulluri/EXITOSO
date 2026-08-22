import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TwoColumnLayoutProps {
  children: ReactNode
  sidebar: ReactNode
  className?: string
  sidebarWidth?: 'sm' | 'md' | 'lg'
}

const sidebarWidths: Record<string, string> = {
  sm: 'lg:w-72',
  md: 'lg:w-80',
  lg: 'lg:w-96',
}

export function TwoColumnLayout({ children, sidebar, className, sidebarWidth = 'md' }: TwoColumnLayoutProps) {
  return (
    <div className={cn('flex flex-col lg:flex-row gap-6', className)}>
      <div className="flex-1 min-w-0">{children}</div>
      <div className={cn('w-full shrink-0', sidebarWidths[sidebarWidth])}>
        {sidebar}
      </div>
    </div>
  )
}
