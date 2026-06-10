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
        <label htmlFor={id} className="text-sm font-bold text-purple-800">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-white text-gray-800 font-medium',
          'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200',
          'transition-colors appearance-none cursor-pointer',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
}
