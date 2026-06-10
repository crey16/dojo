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
        <label htmlFor={id} className="text-sm font-bold text-purple-800">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-3 rounded-2xl border-2 border-purple-200 bg-white text-gray-800 font-medium',
          'focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200',
          'placeholder:text-gray-400 transition-colors',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  )
}
