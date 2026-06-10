'use client'

import { useEffect } from 'react'

interface ConfettiProps {
  trigger: boolean
  onComplete?: () => void
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  useEffect(() => {
    if (!trigger) return

    async function fire() {
      const confetti = (await import('canvas-confetti')).default
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#ec4899', '#fbbf24', '#22c55e', '#3b82f6'],
      })
      setTimeout(() => onComplete?.(), 3000)
    }

    fire()
  }, [trigger, onComplete])

  return null
}
