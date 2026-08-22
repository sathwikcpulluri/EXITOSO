import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface TabsProps {
  defaultValue: string
  children: ReactNode
  className?: string
  variant?: 'underline' | 'pill'
  onValueChange?: (value: string) => void
}

export function Tabs({ defaultValue, children, className, onValueChange }: TabsProps) {
  return (
    <TabsPrimitive.Root defaultValue={defaultValue} onValueChange={onValueChange} className={cn('w-full', className)}>
      {children}
    </TabsPrimitive.Root>
  )
}

interface TabsListProps {
  children: ReactNode
  className?: string
  variant?: 'underline' | 'pill'
}

export function TabsList({ children, className, variant = 'underline' }: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex gap-1',
        variant === 'underline' && 'border-b border-surface-200',
        variant === 'pill' && 'bg-surface-100 p-1 rounded-xl',
        className
      )}
    >
      {children}
    </TabsPrimitive.List>
  )
}

interface TabsTriggerProps {
  value: string
  children: ReactNode
  className?: string
  variant?: 'underline' | 'pill'
}

export function TabsTrigger({ value, children, className, variant = 'underline' }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-all duration-200',
        variant === 'underline' && [
          'border-b-2 border-transparent text-surface-500 hover:text-surface-700',
          'data-[state=active]:border-primary-600 data-[state=active]:text-primary-600',
        ],
        variant === 'pill' && [
          'rounded-lg text-surface-500 hover:text-surface-700',
          'data-[state=active]:bg-white data-[state=active]:text-primary-600 data-[state=active]:shadow-sm',
        ],
        className
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

interface TabsContentProps {
  value: string
  children: ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  return (
    <TabsPrimitive.Content value={value} className={cn('mt-4 animate-fade-in focus:outline-none', className)}>
      {children}
    </TabsPrimitive.Content>
  )
}
