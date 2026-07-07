'use client'

import type { ReactNode } from 'react'

interface RosterModalProps {
  title: string
  subtitle?: string
  children: ReactNode
  onClose: () => void
}

export function RosterModal({ title, subtitle, children, onClose }: RosterModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[rgba(31,26,46,0.45)] p-4 flex items-end sm:items-center justify-center"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-canvas rounded-[28px] shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 animate-pop-in"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display font-bold text-xl text-ink leading-tight">{title}</h2>
            {subtitle && <p className="text-xs font-extrabold text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-shell text-[#6B7280] font-black flex-none cursor-pointer transition-transform active:scale-90 hover:bg-[#E5E1D8]"
          >✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
