import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface TooltipProps {
  children: ReactNode
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  delayDuration?: number
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <TooltipPrimitive.Provider delayDuration={200}>{children}</TooltipPrimitive.Provider>
}

export function Tooltip({ children, content, side = 'top', className, delayDuration = 200 }: TooltipProps) {
  return (
    <TooltipPrimitive.Root delayDuration={delayDuration}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={4}
          className={cn(
            'z-50 px-3 py-1.5 text-xs font-medium text-white bg-surface-900 rounded-lg shadow-lg',
            'animate-fade-in',
            className
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-surface-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}
