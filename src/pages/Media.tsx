import { useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { MediaItem, MediaStatus, MediaType } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { todayISO } from '../lib/id'

const TYPE_LABEL: Record<MediaType, string> = {
  book: 'Book',
  article: 'Article',
  video: 'Video',
  podcast: 'Podcast',
}

const STATUS_LABEL: Record<MediaStatus, string> = {
  want: 'Want to',
  'in-progress': 'In progress',
  done: 'Finished',
}
const STATUS_COLOR: Record<MediaStatus, string> = {
  want: 'var(--text-muted)',
  'in-progress': 'var(--series-1)',
  done: 'var(--status-good)',
}

type FormState = {
  title: string
  type: MediaType
  status: MediaStatus
  rating: number
  url: string
  notes: string
}
const EMPTY_FORM: FormState = { title: '', type: 'book', status: 'want', rating: 0, url: '', notes: '' }

function Stars({ value }: { value: number }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < value ? 'var(--status-warning)' : 'none'}
          stroke={i < value ? 'var(--status-warning)' : 'var(--text-muted)'}
        />
      ))}
    </div>
  )
}

export function Media() {
  const media = useBrainStore((s) => s.media)
  const addMedia = useBrainStore((s) => s.addMedia)
  const updateMedia = useBrainStore((s) => s.updateMedia)
  const deleteMedia = useBrainStore((s) => s.deleteMedia)

  const [typeFilter, setTypeFilter] = useState<MediaType | 'all'>('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const filtered = useMemo(
    () => (typeFilter === 'all' ? media : media.filter((m) => m.type === typeFilter)),
    [media, typeFilter]
  )

  const grouped = useMemo(() => {
    const g: Record<MediaStatus, MediaItem[]> = { 'in-progress': [], want: [], done: [] }
    for (const m of filtered) g[m.status].push(m)
    return g
  }, [filtered])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(m: MediaItem) {
    setEditingId(m.id)
    setForm({ title: m.title, type: m.type, status: m.status, rating: m.rating, url: m.url, notes: m.notes })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      type: form.type,
      status: form.status,
      rating: form.rating,
      url: form.url.trim(),
      notes: form.notes.trim(),
      finishedAt: form.status === 'done' ? todayISO() : null,
    }
    if (editingId) updateMedia(editingId, payload)
    else addMedia(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Reading & Watching"
        description="Books, articles, videos, and podcasts you're consuming or want to."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New item
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['all', 'book', 'article', 'video', 'podcast'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${
              typeFilter === t
                ? 'border-transparent'
                : 'border-line-border text-ink-secondary hover:text-ink-primary'
            }`}
            style={typeFilter === t ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            {t === 'all' ? 'All' : TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nothing here yet" description="Track what you're reading or watching." />
      ) : (
        <div className="space-y-6">
          {(['in-progress', 'want', 'done'] as MediaStatus[]).map((status) =>
            grouped[status].length === 0 ? null : (
              <div key={status}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {STATUS_LABEL[status]} · {grouped[status].length}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {grouped[status].map((m) => (
                    <Card key={m.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-ink-primary">{m.title}</h3>
                        {m.url && (
                          <a
                            href={m.url}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-ink-muted hover:text-ink-primary"
                            aria-label="Open link"
                          >
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-medium"
                          style={{ color: STATUS_COLOR[m.status], backgroundColor: STATUS_COLOR[m.status] + '1a' }}
                        >
                          {TYPE_LABEL[m.type]}
                        </span>
                        <Stars value={m.rating} />
                      </div>
                      {m.notes && <p className="mt-1.5 line-clamp-2 text-sm text-ink-secondary">{m.notes}</p>}
                      <div className="mt-3 flex justify-end gap-1.5">
                        <IconButton label="Edit" onClick={() => openEdit(m)}>
                          <Pencil size={14} />
                        </IconButton>
                        <IconButton label="Delete" danger onClick={() => deleteMedia(m.id)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit item' : 'New item'}>
        <form onSubmit={submit}>
          <FormRow label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              required
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Type">
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MediaType })}
              >
                {(Object.keys(TYPE_LABEL) as MediaType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as MediaStatus })}
              >
                <option value="want">Want to</option>
                <option value="in-progress">In progress</option>
                <option value="done">Finished</option>
              </select>
            </FormRow>
          </div>
          <FormRow label="URL">
            <input
              className={inputClass}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://"
            />
          </FormRow>
          <FormRow label="Rating">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: form.rating === n ? 0 : n })}
                  aria-label={`${n} stars`}
                >
                  <Star
                    size={20}
                    fill={n <= form.rating ? 'var(--status-warning)' : 'none'}
                    stroke={n <= form.rating ? 'var(--status-warning)' : 'var(--text-muted)'}
                  />
                </button>
              ))}
            </div>
          </FormRow>
          <FormRow label="Notes">
            <textarea
              className={inputClass}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add item'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
