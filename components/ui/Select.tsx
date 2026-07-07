'use client'

import { cn } from '@/lib/utils'
import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-extrabold text-body">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-2xl border border-shell bg-white text-ink font-bold',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft',
          'transition-colors appearance-none cursor-pointer',
          error && 'border-negative',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-[13px] font-bold text-negative-ink">{error}</p>}
    </div>
  )
}
