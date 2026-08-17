import { useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Tool } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader, TagPill } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'

type FormState = { name: string; url: string; category: string }
const EMPTY_FORM: FormState = { name: '', url: '', category: '' }

export function Tools() {
  const tools = useBrainStore((s) => s.tools)
  const addTool = useBrainStore((s) => s.addTool)
  const updateTool = useBrainStore((s) => s.updateTool)
  const deleteTool = useBrainStore((s) => s.deleteTool)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(
    () => Array.from(new Set(tools.map((t) => t.category).filter(Boolean))).sort(),
    [tools]
  )
  const filtered = activeCategory ? tools.filter((t) => t.category === activeCategory) : tools

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(t: Tool) {
    setEditingId(t.id)
    setForm({ name: t.name, url: t.url, category: t.category })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    const payload = { name: form.name.trim(), url: form.url.trim(), category: form.category.trim() }
    if (editingId) updateTool(editingId, payload)
    else addTool(payload)
    setOpen(false)
  }

  function hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  return (
    <div>
      <PageHeader
        title="Useful Tools"
        description="Apps, links, and resources you reach for often — quick access whenever you need them."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New tool
          </Button>
        }
      />

      {categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              activeCategory === null
                ? 'border-transparent'
                : 'border-line-border text-ink-secondary hover:text-ink-primary'
            }`}
            style={activeCategory === null ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                activeCategory === c
                  ? 'border-transparent'
                  : 'border-line-border text-ink-secondary hover:text-ink-primary'
              }`}
              style={activeCategory === c ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title="No tools yet" description="Save the apps and links you reach for often." />
      ) : (
        <Card className="divide-y divide-line-hairline">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink-primary">{t.name}</p>
                  {t.category && <TagPill label={t.category} />}
                </div>
                {t.url && <p className="mt-0.5 truncate text-xs text-ink-muted">{hostname(t.url)}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-border text-ink-secondary hover:text-ink-primary"
                    aria-label="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
                <IconButton label="Edit" onClick={() => openEdit(t)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton label="Delete" danger onClick={() => deleteTool(t.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit tool' : 'New tool'}>
        <form onSubmit={submit}>
          <FormRow label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
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
          <FormRow label="Category">
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Design, Focus, Automation…"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add tool'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
