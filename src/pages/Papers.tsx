import { useMemo, useState } from 'react'
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { LifeArea, Paper, PaperType } from '../types'
import { AreaPill, Button, Card, EmptyState, IconButton, PageHeader } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { LIFE_AREAS } from '../lib/seed'

const TYPES: PaperType[] = ['Essay', 'Web article', 'Guide', 'Research paper']

type FormState = { title: string; url: string; type: PaperType; area: LifeArea }
const EMPTY_FORM: FormState = { title: '', url: '', type: 'Essay', area: 'Learning' }

export function Papers() {
  const papers = useBrainStore((s) => s.papers)
  const addPaper = useBrainStore((s) => s.addPaper)
  const updatePaper = useBrainStore((s) => s.updatePaper)
  const deletePaper = useBrainStore((s) => s.deletePaper)

  const [typeFilter, setTypeFilter] = useState<PaperType | 'all'>('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const filtered = useMemo(
    () => (typeFilter === 'all' ? papers : papers.filter((p) => p.type === typeFilter)),
    [papers, typeFilter]
  )

  function hostname(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return url
    }
  }

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(p: Paper) {
    setEditingId(p.id)
    setForm({ title: p.title, url: p.url, type: p.type, area: p.area })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = { title: form.title.trim(), url: form.url.trim(), type: form.type, area: form.area }
    if (editingId) updatePaper(editingId, payload)
    else addPaper(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Papers"
        description="Essays, articles, and research — build a personal library of valuable knowledge."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New paper
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['all', ...TYPES] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              typeFilter === t
                ? 'border-transparent'
                : 'border-line-border text-ink-secondary hover:text-ink-primary'
            }`}
            style={typeFilter === t ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            {t === 'all' ? 'All' : t}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No papers yet" description="Save the essays and research you want to keep." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-primary">{p.title}</h3>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-ink-muted hover:text-ink-primary"
                    aria-label="Open link"
                  >
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
              {p.url && <p className="mt-1 truncate text-xs text-ink-muted">{hostname(p.url)}</p>}
              <div className="mt-2 flex items-center gap-1.5">
                <span className="rounded-full border border-line-border px-2 py-0.5 text-xs text-ink-secondary">
                  {p.type}
                </span>
                <AreaPill area={p.area} />
              </div>
              <div className="mt-3 flex justify-end gap-1.5">
                <IconButton label="Edit" onClick={() => openEdit(p)}>
                  <Pencil size={14} />
                </IconButton>
                <IconButton label="Delete" danger onClick={() => deletePaper(p.id)}>
                  <Trash2 size={14} />
                </IconButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit paper' : 'New paper'}>
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
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Type">
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as PaperType })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Area">
              <select
                className={inputClass}
                value={form.area}
                onChange={(e) => setForm({ ...form, area: e.target.value as LifeArea })}
              >
                {LIFE_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </FormRow>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add paper'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
