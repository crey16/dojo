'use client'

import { cn } from '@/lib/utils'

interface Tab {
  id: string
  label: string
  emoji?: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex gap-1 bg-shell p-1 rounded-full">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-full text-[13px] font-black transition-all cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            activeTab === tab.id
              ? 'bg-white text-primary shadow-[0_2px_6px_rgba(0,0,0,0.08)]'
              : 'text-muted hover:text-body'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
