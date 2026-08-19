import { useEffect } from 'react'
import { useBrainStore } from '../store'

function contrastInk(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#1a0a08' : '#ffffff'
}

// Applies the user's custom accent colour as a CSS variable override, on top
// of whatever the light/dark theme's default --brand-accent is.
export function AccentEffect() {
  const customAccent = useBrainStore((s) => s.customAccent)

  useEffect(() => {
    const root = document.documentElement
    if (customAccent) {
      root.style.setProperty('--brand-accent', customAccent)
      root.style.setProperty('--brand-accent-ink', contrastInk(customAccent))
    } else {
      root.style.removeProperty('--brand-accent')
      root.style.removeProperty('--brand-accent-ink')
    }
  }, [customAccent])

  return null
}
