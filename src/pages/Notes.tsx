import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Note } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader, TagPill } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { useAutoOpenFromQuery } from '../lib/useAutoOpenFromQuery'

type FormState = { title: string; content: string; tags: string }
const EMPTY_FORM: FormState = { title: '', content: '', tags: '' }

export function Notes() {
  const notes = useBrainStore((s) => s.notes)
  const addNote = useBrainStore((s) => s.addNote)
  const updateNote = useBrainStore((s) => s.updateNote)
  const deleteNote = useBrainStore((s) => s.deleteNote)

  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const allTags = useMemo(() => Array.from(new Set(notes.flatMap((n) => n.tags))).sort(), [notes])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...notes]
      .filter((n) => (activeTag ? n.tags.includes(activeTag) : true))
      .filter(
        (n) => !q || n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      )
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [notes, query, activeTag])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  useAutoOpenFromQuery(openCreate)

  function openEdit(n: Note) {
    setEditingId(n.id)
    setForm({ title: n.title, content: n.content, tags: n.tags.join(', ') })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      content: form.content.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    if (editingId) updateNote(editingId, payload)
    else addNote(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Notes"
        description="Your knowledge base — capture ideas, references, and reflections."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New note
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            className={`${inputClass} pl-8`}
            placeholder="Search notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                activeTag === null
                  ? 'border-transparent'
                  : 'border-line-border text-ink-secondary hover:text-ink-primary'
              }`}
              style={activeTag === null ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                  activeTag === tag
                    ? 'border-transparent'
                    : 'border-line-border text-ink-secondary hover:text-ink-primary'
                }`}
                style={activeTag === tag ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No notes found" description="Try a different search or capture a new note." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((n) => (
            <Card key={n.id} className="flex flex-col p-4">
              <h3 className="text-sm font-semibold text-ink-primary">{n.title}</h3>
              <p className="mt-1.5 line-clamp-4 flex-1 whitespace-pre-line text-sm text-ink-secondary">
                {n.content}
              </p>
              {n.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {n.tags.map((t) => (
                    <TagPill key={t} label={t} />
                  ))}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  Updated {new Date(n.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex gap-1.5">
                  <IconButton label="Edit" onClick={() => openEdit(n)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteNote(n.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit note' : 'New note'}>
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
          <FormRow label="Content">
            <textarea
              className={inputClass}
              rows={6}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </FormRow>
          <FormRow label="Tags (comma separated)">
            <input
              className={inputClass}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="ideas, reference"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create note'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
