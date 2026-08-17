import { useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { LearningSphere, LifeArea } from '../types'
import { AreaPill, Button, Card, EmptyState, IconButton, PageHeader, ProgressBar, areaAccent } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { LIFE_AREAS } from '../lib/seed'

export function Learning() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const spheres = useBrainStore((s) => s.learningSpheres)
  const selected = spheres.find((s) => s.id === selectedId) ?? null

  return selected ? (
    <SphereTopicsView sphere={selected} onBack={() => setSelectedId(null)} />
  ) : (
    <SpheresGrid onSelect={setSelectedId} />
  )
}

function SpheresGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const spheres = useBrainStore((s) => s.learningSpheres)
  const topics = useBrainStore((s) => s.sphereTopics)
  const addLearningSphere = useBrainStore((s) => s.addLearningSphere)
  const updateLearningSphere = useBrainStore((s) => s.updateLearningSphere)
  const deleteLearningSphere = useBrainStore((s) => s.deleteLearningSphere)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; area: LifeArea }>({ name: '', area: 'Learning' })

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', area: 'Learning' })
    setOpen(true)
  }

  function openEdit(sphere: LearningSphere) {
    setEditingId(sphere.id)
    setForm({ name: sphere.name, area: sphere.area })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) updateLearningSphere(editingId, { name: form.name.trim(), area: form.area })
    else addLearningSphere({ name: form.name.trim(), area: form.area })
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Learning Spheres"
        description="Organize the topics and skills you want to master."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New sphere
          </Button>
        }
      />

      {spheres.length === 0 ? (
        <EmptyState title="No spheres yet" description="Group the skills you're building into spheres." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {spheres.map((sphere) => {
            const sphereTopics = topics.filter((t) => t.sphereId === sphere.id)
            const done = sphereTopics.filter((t) => t.done).length
            return (
              <Card key={sphere.id} className="overflow-hidden">
                <button onClick={() => onSelect(sphere.id)} className="block w-full text-left">
                  <div
                    className="flex h-20 items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: `linear-gradient(155deg, ${areaAccent(sphere.area)}, color-mix(in srgb, ${areaAccent(sphere.area)} 40%, black))`,
                    }}
                  >
                    {sphere.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-ink-primary">{sphere.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <AreaPill area={sphere.area} />
                      <span className="tabular text-xs text-ink-muted">
                        {done}/{sphereTopics.length}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex justify-end gap-1.5 border-t border-line-hairline p-2">
                  <IconButton label="Edit" onClick={() => openEdit(sphere)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteLearningSphere(sphere.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit sphere' : 'New sphere'}>
        <form onSubmit={submit}>
          <FormRow label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Programming"
            />
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
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create sphere'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function SphereTopicsView({ sphere, onBack }: { sphere: LearningSphere; onBack: () => void }) {
  const topics = useBrainStore((s) => s.sphereTopics.filter((t) => t.sphereId === sphere.id))
  const addSphereTopic = useBrainStore((s) => s.addSphereTopic)
  const toggleSphereTopic = useBrainStore((s) => s.toggleSphereTopic)
  const deleteSphereTopic = useBrainStore((s) => s.deleteSphereTopic)

  const [title, setTitle] = useState('')
  const done = topics.filter((t) => t.done).length
  const progress = topics.length ? Math.round((done / topics.length) * 100) : 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addSphereTopic({ title: title.trim(), sphereId: sphere.id })
    setTitle('')
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft size={15} /> Back to spheres
      </button>
      <PageHeader title={sphere.name} description={`Topics in this sphere — ${done}/${topics.length} mastered.`} />

      <Card className="mb-4 p-4">
        <ProgressBar value={progress} accent={areaAccent(sphere.area)} />
      </Card>

      <form onSubmit={submit} className="mb-4 flex gap-2">
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a topic…"
        />
        <Button type="submit">
          <Plus size={16} /> Add
        </Button>
      </form>

      {topics.length === 0 ? (
        <EmptyState title="No topics yet" description="Break this sphere into clear, masterable topics." />
      ) : (
        <Card className="divide-y divide-line-hairline">
          {topics.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleSphereTopic(t.id)}
                  className="h-4 w-4 accent-[var(--brand-accent)]"
                />
                <span className={`truncate text-sm ${t.done ? 'text-ink-muted line-through' : 'text-ink-primary'}`}>
                  {t.title}
                </span>
              </label>
              <IconButton label="Delete" danger onClick={() => deleteSphereTopic(t.id)}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
