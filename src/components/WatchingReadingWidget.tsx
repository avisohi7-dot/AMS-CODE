import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { useBrainStore } from '../store'
import type { MediaItem, MediaType } from '../types'
import { Card } from './ui'

function Stars({ value }: { value: number }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          fill={i < value ? 'var(--status-warning)' : 'none'}
          stroke={i < value ? 'var(--status-warning)' : 'var(--text-muted)'}
        />
      ))}
    </div>
  )
}

function MediaList({ title, items }: { title: string; items: MediaItem[] }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">{title}</h2>
        <Link to="/media" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-secondary">Nothing in progress.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3">
              <span className="truncate text-sm text-ink-primary">{m.title}</span>
              <Stars value={m.rating} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

const WATCH_TYPES: MediaType[] = ['video', 'podcast']
const READ_TYPES: MediaType[] = ['book', 'article']

export function WatchingReadingWidget() {
  const media = useBrainStore((s) => s.media)
  const watching = media.filter((m) => WATCH_TYPES.includes(m.type) && m.status === 'in-progress')
  const reading = media.filter((m) => READ_TYPES.includes(m.type) && m.status === 'in-progress')

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MediaList title="Watching now" items={watching} />
      <MediaList title="Reading now" items={reading} />
    </div>
  )
}
