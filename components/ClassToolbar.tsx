'use client'

import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

interface ClassToolbarProps {
  isAdmin: boolean
  selecting: boolean
  onAdd: () => void
  onToggleSelect: () => void
  onReset: () => void
}

export function ClassToolbar({ isAdmin, selecting, onAdd, onToggleSelect }: ClassToolbarProps) {
  if (!isAdmin) return null

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        className={cn(
          'px-3.5 py-2 rounded-full text-xs font-black cursor-pointer transition-colors',
          selecting ? 'bg-primary-soft text-primary-dark' : 'text-[#6B7280] hover:bg-shell'
        )}
        onClick={onToggleSelect}
      >
        {selecting ? 'Cancel multiple' : 'Award multiple'}
      </button>
      <Button size="sm" onClick={onAdd}>+ Add member</Button>
    </div>
  )
}
