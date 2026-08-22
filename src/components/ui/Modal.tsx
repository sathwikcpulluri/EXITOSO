import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'
import type { ModalSize } from '@/types'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
  size?: ModalSize
  title?: string
  description?: string
  showClose?: boolean
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  fullscreen: 'max-w-[95vw] max-h-[95vh]',
}

export function Modal({ open, onOpenChange, children, size = 'md', title, description, showClose = true }: ModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50',
            'bg-white rounded-2xl shadow-modal p-6',
            'w-[calc(100%-2rem)]',
            'data-[state=open]:animate-scale-in',
            'focus:outline-none',
            'max-h-[85vh] overflow-y-auto',
            sizeStyles[size]
          )}
        >
          {(title || showClose) && (
            <div className="flex items-start justify-between mb-4">
              <div>
                {title && (
                  <DialogPrimitive.Title className="text-lg font-semibold text-surface-900">
                    {title}
                  </DialogPrimitive.Title>
                )}
                {description && (
                  <DialogPrimitive.Description className="text-sm text-surface-500 mt-1">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              {showClose && (
                <DialogPrimitive.Close className="rounded-lg p-1.5 text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors">
                  <X className="h-4 w-4" />
                </DialogPrimitive.Close>
              )}
            </div>
          )}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
