import { Brain } from 'lucide-react'

export function HeroBanner({ subtitle }: { subtitle: string }) {
  return (
    <div className="hero-banner rounded-card border border-line-border px-6 py-10 text-center sm:px-10 sm:py-14">
      <div
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' }}
      >
        <Brain size={28} />
      </div>
      <h1 className="text-3xl font-bold text-white sm:text-4xl">Second Brain OS</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-white/70">{subtitle}</p>
    </div>
  )
}
