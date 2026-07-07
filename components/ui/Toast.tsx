'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  message: string
  variant?: 'success' | 'error'
  onDismiss: () => void
}

// Auto-dismissing notification pinned top-right (top-center on small screens)
export function Toast({ message, variant = 'success', onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, 3200)
    return () => clearTimeout(timer)
  }, [message, onDismiss])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-4 right-4 left-4 sm:left-auto z-[100] flex items-center gap-3 rounded-2xl px-4 py-3',
        'shadow-[0_6px_20px_rgba(0,0,0,0.12)] animate-pop-in sm:max-w-sm',
        variant === 'success' ? 'bg-positive-soft' : 'bg-negative-soft'
      )}
    >
      <span className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center flex-none text-white text-xs font-black',
        variant === 'success' ? 'bg-positive' : 'bg-negative'
      )}>
        {variant === 'success' ? '✓' : '!'}
      </span>
      <p className={cn(
        'flex-1 text-[13px] font-extrabold',
        variant === 'success' ? 'text-positive-ink' : 'text-negative-ink'
      )}>
        {message}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className={cn(
          'font-black text-sm cursor-pointer px-1',
          variant === 'success' ? 'text-positive-ink' : 'text-negative-ink'
        )}
      >✕</button>
    </div>
  )
}
