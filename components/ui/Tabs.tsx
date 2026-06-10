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
    <div className="flex gap-1 bg-purple-100 p-1 rounded-2xl">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-bold transition-all',
            activeTab === tab.id
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-purple-500 hover:text-purple-700'
          )}
        >
          {tab.emoji && <span>{tab.emoji}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  )
}
