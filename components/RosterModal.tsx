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
    <div className="fixed inset-0 z-50 bg-purple-950/40 p-4 flex items-center justify-center" onMouseDown={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-purple-100 w-full max-w-md max-h-[90vh] overflow-y-auto p-5" onMouseDown={event => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-black text-xl text-purple-950">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 font-black">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}
