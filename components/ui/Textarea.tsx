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
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900',
          'focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100',
          'placeholder:text-gray-400 transition-colors resize-none',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
}
