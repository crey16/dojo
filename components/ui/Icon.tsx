import { cn } from '@/lib/utils'

const PATHS: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />,
  trophy: <path d="M8 21h8m-4-4v4m-6-17h12v5a6 6 0 0 1-12 0V4Zm12 2h2a2 2 0 0 1-2 4M6 6H4a2 2 0 0 0 2 4" />,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" /></>,
  gift: <path d="M20 12v9H4v-9m-1-5h18v5H3V7Zm9-3v17M12 7H8.5a2.25 2.25 0 1 1 0-4.5C11 2.5 12 7 12 7Zm0 0h3.5a2.25 2.25 0 1 0 0-4.5C13 2.5 12 7 12 7Z" />,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.7a3.5 3.5 0 0 1 0 6.6m2 8.7h3.5a6.5 6.5 0 0 0-4.5-6.2" /></>,
  crown: <path d="m3 7 4.5 4L12 4l4.5 7L21 7l-1.5 12h-15L3 7Z" />,
  settings: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.9 4.9l2.1 2.1m10 10 2.1 2.1m0-14.2-2.1 2.1m-10 10-2.1 2.1" /></>,
  edit: <path d="M17 3.5 20.5 7 8.5 19H5v-3.5l12-12ZM14.5 6l3.5 3.5" />,
  trash: <path d="M4 7h16M10 11v6m4-6v6M6 7l1 14h10l1-14M9 7V4h6v3" />,
  pause: <path d="M8 5v14m8-14v14" />,
  play: <path d="M7 4.5 19 12 7 19.5v-15Z" />,
  undo: <path d="M4 10h11a5 5 0 0 1 0 10h-4M4 10l4-4m-4 4 4 4" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  x: <path d="m5 5 14 14m0-14L5 19" />,
  key: <><circle cx="8" cy="15" r="4.5" /><path d="M11.5 11.5 20 3m-3 3 3 3" /></>,
  star: <path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.6l6.3-.8L12 3Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  flag: <path d="M6 21V4M6 4.5c4-2 8 2 12 .5v9c-4 1.5-8-2.5-12-.5" />,
  shield: <path d="M12 3l7 3v5c0 5-3.5 8.2-7 9.5C8.5 19.2 5 16 5 11V6z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  flame: <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5Z" />,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
  laugh: <><circle cx="12" cy="12" r="9" /><path d="M8 13a4 4 0 0 0 8 0H8Z" /><path d="M9 9h.01M15 9h.01" /></>,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />,
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />,
  meh: <><circle cx="12" cy="12" r="9" /><path d="M8 15h8" /><path d="M9 9h.01M15 9h.01" /></>,
  feather: <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76Z" /><path d="M16 8 2 22" /><path d="M17.5 15H9" /></>,
  'thumbs-down': <><path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" /></>,
  ghost: <><path d="M9 10h.01M15 10h.01" /><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8Z" /></>,
  skull: <><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><path d="M8 20v2h8v-2" /><path d="m12.5 17-.5-1-.5 1h1Z" /><path d="M16 20a2 2 0 0 0 1.56-3.25 8 8 0 1 0-11.12 0A2 2 0 0 0 8 20" /></>,
  dice: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01M12 12h.01" /></>,
}

export type IconName = keyof typeof PATHS

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn('flex-shrink-0', className)}
    >
      {PATHS[name]}
    </svg>
  )
}
