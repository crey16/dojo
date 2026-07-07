'use client'

import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-extrabold text-body">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-2xl border border-shell bg-white text-ink font-bold',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft',
          'placeholder:text-muted placeholder:font-semibold transition-colors',
          error && 'border-negative focus:border-negative focus:ring-negative-soft',
          className
        )}
        {...props}
      />
      {error && <p className="text-[13px] font-bold text-negative-ink">{error}</p>}
    </div>
  )
}
