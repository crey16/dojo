'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-b-4'

  const variants = {
    primary: 'bg-purple-600 text-white border-purple-800 hover:bg-purple-700 shadow-md',
    secondary: 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50 shadow-sm',
    danger: 'bg-red-500 text-white border-red-700 hover:bg-red-600 shadow-md',
    ghost: 'bg-transparent text-purple-700 border-transparent hover:bg-purple-100',
    success: 'bg-green-500 text-white border-green-700 hover:bg-green-600 shadow-md',
  }

  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-5 py-2.5',
    lg: 'text-lg px-7 py-3.5',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : children}
    </button>
  )
}
