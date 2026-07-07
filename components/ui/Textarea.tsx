'use client'

import { cn } from '@/lib/utils'
import type { TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-[13px] font-extrabold text-body">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full px-4 py-2.5 rounded-2xl border border-shell bg-white text-ink font-bold',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-soft',
          'placeholder:text-muted placeholder:font-semibold transition-colors resize-none',
          error && 'border-negative',
          className
        )}
        {...props}
      />
      {error && <p className="text-[13px] font-bold text-negative-ink">{error}</p>}
    </div>
  )
}
