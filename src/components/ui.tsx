import type { ReactNode } from 'react'
import type { LifeArea, TaskPriority, TaskStatus } from '../types'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-card border border-line-border bg-surface-1 ${className}`}
    >
      {children}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-ink-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-secondary">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatTile({
  label,
  value,
  hint,
  accent = 'var(--series-1)',
}: {
  label: string
  value: string | number
  hint?: string
  accent?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">{label}</span>
      </div>
      <div className="tabular mt-2 text-3xl font-semibold text-ink-primary">{value}</div>
      {hint && <div className="mt-1 text-xs text-ink-secondary">{hint}</div>}
    </Card>
  )
}

export function ProgressBar({ value, accent = 'var(--series-1)' }: { value: number; accent?: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-line-hairline"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-[width]"
        style={{ width: `${clamped}%`, backgroundColor: accent }}
      />
    </div>
  )
}

export function TagPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-line-border px-2 py-0.5 text-xs text-ink-secondary">
      {label}
    </span>
  )
}

const AREA_ACCENTS: Record<LifeArea, string> = {
  Health: 'var(--series-3)',
  Career: 'var(--series-1)',
  Finance: 'var(--series-4)',
  Relationships: 'var(--series-5)',
  Learning: 'var(--series-7)',
  Personal: 'var(--series-2)',
}

export function areaAccent(area: LifeArea): string {
  return AREA_ACCENTS[area]
}

export function AreaPill({ area }: { area: LifeArea }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-line-border px-2 py-0.5 text-xs text-ink-secondary"
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: areaAccent(area) }} />
      {area}
    </span>
  )
}

const STATUS_STYLES: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: 'To do', color: 'var(--text-muted)' },
  'in-progress': { label: 'In progress', color: 'var(--series-1)' },
  done: { label: 'Done', color: 'var(--status-good)' },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const s = STATUS_STYLES[status]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
      {s.label}
    </span>
  )
}

const PRIORITY_STYLES: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: 'var(--text-muted)' },
  medium: { label: 'Medium', color: 'var(--status-warning)' },
  high: { label: 'High', color: 'var(--status-critical)' },
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const s = PRIORITY_STYLES[priority]
  return (
    <span
      className="rounded-full border px-2 py-0.5 text-xs font-medium"
      style={{ color: s.color, borderColor: s.color + '55' }}
    >
      {s.label}
    </span>
  )
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line-border px-6 py-14 text-center">
      <p className="text-sm font-medium text-ink-primary">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-secondary">{description}</p>}
    </div>
  )
}

export function IconButton({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: ReactNode
  onClick: () => void
  label: string
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-border text-ink-secondary transition-colors hover:bg-surface-plane ${
        danger ? 'hover:border-status-critical hover:text-status-critical' : 'hover:text-ink-primary'
      }`}
    >
      {children}
    </button>
  )
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  className = '',
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  type?: 'button' | 'submit'
  className?: string
}) {
  const base =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
  const styles =
    variant === 'primary'
      ? 'text-white'
      : variant === 'secondary'
        ? 'border border-line-border text-ink-primary hover:bg-surface-plane'
        : 'text-ink-secondary hover:text-ink-primary'
  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles} ${className}`}
      style={variant === 'primary' ? { backgroundColor: 'var(--series-1)' } : undefined}
    >
      {children}
    </button>
  )
}

export function fmtDate(iso: string | null): string {
  if (!iso) return 'No date'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const target = new Date(iso + 'T00:00:00').getTime()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  return Math.round((target - today) / (1000 * 60 * 60 * 24))
}
