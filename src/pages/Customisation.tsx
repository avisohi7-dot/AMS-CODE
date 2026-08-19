import { Check } from 'lucide-react'
import { useBrainStore } from '../store'
import type { ClockStyle } from '../types'
import { Button, Card, PageHeader } from '../components/ui'
import { ClockWidget } from '../components/ClockWidget'

const ACCENT_PRESETS = [
  { label: 'Red', value: '#d1342e' },
  { label: 'Orange', value: '#e2711d' },
  { label: 'Amber', value: '#d4a017' },
  { label: 'Green', value: '#2f9e44' },
  { label: 'Teal', value: '#0f9b8e' },
  { label: 'Blue', value: '#3568d4' },
  { label: 'Purple', value: '#7c4fd1' },
  { label: 'Pink', value: '#d1417f' },
]

const CLOCK_STYLES: { key: ClockStyle; label: string; description: string }[] = [
  { key: 'analog', label: 'Classic', description: 'Ticks with thin hands' },
  { key: 'analog-roman', label: 'Roman', description: 'Roman numerals, serif' },
  { key: 'analog-numbers', label: 'Numbered', description: 'All 12 numbers shown' },
  { key: 'analog-modern', label: 'Modern', description: 'Bold coloured hands' },
  { key: 'digital', label: 'Digital', description: 'Large bold time display' },
  { key: 'minimal', label: 'Minimal', description: 'Compact time and date' },
]

export function Customisation() {
  const customAccent = useBrainStore((s) => s.customAccent)
  const setCustomAccent = useBrainStore((s) => s.setCustomAccent)
  const clockStyle = useBrainStore((s) => s.clockStyle)
  const setClockStyle = useBrainStore((s) => s.setClockStyle)

  const currentAccent = customAccent ?? '#d1342e'

  return (
    <div>
      <PageHeader title="Customisation" description="Make Success Portal look like yours." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-ink-primary">Accent colour</h2>
          <p className="mb-4 text-xs text-ink-secondary">
            Used across buttons, highlights, and the logo throughout the app.
          </p>

          <div className="mb-4 grid grid-cols-4 gap-3 sm:grid-cols-8">
            {ACCENT_PRESETS.map((preset) => {
              const active = customAccent?.toLowerCase() === preset.value.toLowerCase()
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setCustomAccent(preset.value)}
                  title={preset.label}
                  aria-label={preset.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: preset.value,
                    borderColor: active ? 'var(--text-primary)' : 'transparent',
                  }}
                >
                  {active && <Check size={15} color="#fff" strokeWidth={3} />}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-ink-secondary">
              Custom
              <input
                type="color"
                value={currentAccent}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded border border-line-border bg-transparent p-0"
              />
            </label>
            <Button variant="secondary" onClick={() => setCustomAccent(null)}>
              Reset to default
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-ink-primary">Clock style</h2>
          <p className="mb-4 text-xs text-ink-secondary">Shown on your Dashboard.</p>

          <div className="mb-4 grid grid-cols-3 gap-2">
            {CLOCK_STYLES.map((style) => {
              const active = clockStyle === style.key
              return (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setClockStyle(style.key)}
                  className="rounded-lg border p-3 text-left transition-colors"
                  style={{
                    borderColor: active ? 'var(--brand-accent)' : 'var(--border)',
                    backgroundColor: active ? 'color-mix(in srgb, var(--brand-accent) 10%, transparent)' : 'transparent',
                  }}
                >
                  <p className="text-xs font-semibold text-ink-primary">{style.label}</p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{style.description}</p>
                </button>
              )
            })}
          </div>

          <div className="flex justify-center">
            <ClockWidget />
          </div>
        </Card>
      </div>
    </div>
  )
}
