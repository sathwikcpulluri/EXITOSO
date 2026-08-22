import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import type { BreadcrumbItem } from '@/types'

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumbs && <Breadcrumb items={breadcrumbs} className="mb-3" />}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{title}</h1>
          {subtitle && <p className="text-sm text-surface-500 mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  )
}
