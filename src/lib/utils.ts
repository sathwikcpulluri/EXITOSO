import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-accent-emerald'
  if (score >= 75) return 'text-primary-600'
  if (score >= 51) return 'text-accent-amber'
  return 'text-accent-rose'
}

export function getScoreBg(score: number): string {
  if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (score >= 75) return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  if (score >= 51) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-rose-50 text-rose-700 border-rose-200'
}

export function getScoreStroke(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 75) return '#4F46E5'
  if (score >= 51) return '#F59E0B'
  return '#F43F5E'
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 51) return 'Moderate'
  return 'Low'
}

export function getRecommendationLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: 'Strong Match', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' }
  if (score >= 70) return { label: 'Good Match', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' }
  if (score >= 50) return { label: 'Moderate Match', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' }
  return { label: 'Low Match', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' }
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
