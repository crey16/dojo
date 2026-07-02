'use client'

interface ClassToolbarProps {
  isAdmin: boolean
  selecting: boolean
  onAdd: () => void
  onToggleSelect: () => void
  onReset: () => void
}

export function ClassToolbar({ isAdmin, selecting, onAdd, onToggleSelect, onReset }: ClassToolbarProps) {
  const placeholders = [
    ['⚙️', 'Settings'], ['📋', 'Attendance'], ['⏱️', 'Timer'], ['🎲', 'Random'],
  ]

  return (
    <div className="class-toolbar">
      <div className="flex items-center gap-1 overflow-x-auto">
        {placeholders.map(([emoji, label]) => (
          <button key={label} className="class-tool" title={`${label} coming soon`}>
            <span>{emoji}</span><span>{label}</span>
          </button>
        ))}
        {isAdmin && (
          <button className={`class-tool ${selecting ? 'class-tool-active' : ''}`} onClick={onToggleSelect}>
            <span>☑️</span><span>{selecting ? 'Cancel Multiple' : 'Award Multiple'}</span>
          </button>
        )}
      </div>
      {isAdmin && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="class-tool hidden sm:flex" onClick={onReset}><span>🧹</span><span>Reset bubbles</span></button>
          <button className="class-add-button" onClick={onAdd}>+ Add Member</button>
        </div>
      )}
    </div>
  )
}
