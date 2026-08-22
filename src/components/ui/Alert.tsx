import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useState } from 'react'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: ReactNode
  dismissable?: boolean
  className?: string
}

const variantConfig = {
  info: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', Icon: Info },
  success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', Icon: CheckCircle2 },
  warning: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', Icon: AlertTriangle },
  error: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-800', Icon: AlertCircle },
}

export function Alert({ variant = 'info', title, children, dismissable, className }: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const config = variantConfig[variant]

  if (dismissed) return null

  return (
    <div className={cn('flex gap-3 p-4 rounded-xl border', config.bg, className)}>
      <config.Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.text)} />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('text-sm font-semibold mb-1', config.text)}>{title}</p>}
        <div className={cn('text-sm', config.text)}>{children}</div>
      </div>
      {dismissable && (
        <button
          onClick={() => setDismissed(true)}
          className={cn('shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors', config.text)}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
