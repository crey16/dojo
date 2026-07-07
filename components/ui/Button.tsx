'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-1.5 font-black rounded-full transition-all active:translate-y-px disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark btn-edge',
    secondary: 'bg-primary-soft text-primary-dark hover:bg-[#EBE4F9]',
    danger: 'bg-negative-soft text-negative-ink hover:bg-[#FECACA]',
    ghost: 'bg-transparent text-muted hover:bg-shell hover:text-body',
    success: 'bg-positive text-white hover:bg-[#16A34A] btn-edge',
  }

  const sizes = {
    sm: 'text-[13px] px-4 py-2',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-7 h-12',
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
