import { useMemo, useState } from 'react'
import { Archive, ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Resource } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader, TagPill } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'

type FormState = { title: string; url: string; notes: string; tags: string }
const EMPTY_FORM: FormState = { title: '', url: '', notes: '', tags: '' }

export function Resources() {
  const resources = useBrainStore((s) => s.resources.filter((r) => !r.archived))
  const addResource = useBrainStore((s) => s.addResource)
  const updateResource = useBrainStore((s) => s.updateResource)
  const deleteResource = useBrainStore((s) => s.deleteResource)
  const archiveResource = useBrainStore((s) => s.archiveResource)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = useMemo(
    () => Array.from(new Set(resources.flatMap((r) => r.tags))).sort(),
    [resources]
  )

  const filtered = activeTag ? resources.filter((r) => r.tags.includes(activeTag)) : resources

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(r: Resource) {
    setEditingId(r.id)
    setForm({ title: r.title, url: r.url, notes: r.notes, tags: r.tags.join(', ') })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      notes: form.notes.trim(),
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }
    if (editingId) updateResource(editingId, payload)
    else addResource(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Topics and references of ongoing interest — links, articles, cheat sheets."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New resource
          </Button>
        }
      />

      {allTags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
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

      {filtered.length === 0 ? (
        <EmptyState title="No resources yet" description="Save links and reference material you want to revisit." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-primary">{r.title}</h3>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-ink-muted hover:text-ink-primary"
                    aria-label="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {r.notes && <p className="mt-1.5 line-clamp-2 text-sm text-ink-secondary">{r.notes}</p>}
              {r.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.tags.map((t) => (
                    <TagPill key={t} label={t} />
                  ))}
                </div>
              )}
              <div className="mt-3 flex justify-end gap-1.5">
                <IconButton label="Edit" onClick={() => openEdit(r)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton label="Archive" onClick={() => archiveResource(r.id, true)}>
                  <Archive size={14} />
                </IconButton>
                <IconButton label="Delete" danger onClick={() => deleteResource(r.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit resource' : 'New resource'}>
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
          <FormRow label="URL">
            <input
              className={inputClass}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://"
            />
          </FormRow>
          <FormRow label="Notes">
            <textarea
              className={inputClass}
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </FormRow>
          <FormRow label="Tags (comma separated)">
            <input
              className={inputClass}
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="productivity, reading"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create resource'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
