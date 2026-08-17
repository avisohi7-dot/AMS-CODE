import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Goal, GoalStatus, LifeArea } from '../types'
import {
  AreaPill,
  Button,
  Card,
  EmptyState,
  IconButton,
  PageHeader,
  ProgressBar,
  areaAccent,
  fmtDate,
} from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { LIFE_AREAS } from '../lib/seed'
import { useAutoOpenFromQuery } from '../lib/useAutoOpenFromQuery'

type FormState = {
  title: string
  area: LifeArea
  status: GoalStatus
  progress: number
  targetDate: string
}
const EMPTY_FORM: FormState = {
  title: '',
  area: 'Career',
  status: 'in-progress',
  progress: 0,
  targetDate: '',
}

const STATUS_LABEL: Record<GoalStatus, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  achieved: 'Achieved',
}

export function Goals() {
  const goals = useBrainStore((s) => s.goals)
  const addGoal = useBrainStore((s) => s.addGoal)
  const updateGoal = useBrainStore((s) => s.updateGoal)
  const deleteGoal = useBrainStore((s) => s.deleteGoal)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  useAutoOpenFromQuery(openCreate)

  function openEdit(g: Goal) {
    setEditingId(g.id)
    setForm({
      title: g.title,
      area: g.area,
      status: g.status,
      progress: g.progress,
      targetDate: g.targetDate ?? '',
    })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const progress = form.status === 'achieved' ? 100 : Math.max(0, Math.min(100, form.progress))
    const payload = {
      title: form.title.trim(),
      area: form.area,
      status: form.status,
      progress,
      targetDate: form.targetDate || null,
    }
    if (editingId) updateGoal(editingId, payload)
    else addGoal(payload)
    setOpen(false)
  }

  const sorted = [...goals].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'achieved' ? 1 : -1
    return 0
  })

  return (
    <div>
      <PageHeader
        title="Goals"
        description="Longer-term outcomes tied to your life areas."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New goal
          </Button>
        }
      />

      {sorted.length === 0 ? (
        <EmptyState title="No goals yet" description="Set a goal and tie it to a life area to track progress." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink-primary">{g.title}</h3>
                <AreaPill area={g.area} />
              </div>
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
                  <span>{STATUS_LABEL[g.status]}</span>
                  <span className="tabular">{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} accent={areaAccent(g.area)} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-ink-muted">
                  {g.targetDate ? `Target ${fmtDate(g.targetDate)}` : 'No target date'}
                </span>
                <div className="flex gap-1.5">
                  <IconButton label="Edit" onClick={() => openEdit(g)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteGoal(g.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit goal' : 'New goal'}>
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
            <FormRow label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as GoalStatus })}
              >
                <option value="not-started">Not started</option>
                <option value="in-progress">In progress</option>
                <option value="achieved">Achieved</option>
              </select>
            </FormRow>
          </div>
          <FormRow label={`Progress (${form.progress}%)`}>
            <input
              type="range"
              min={0}
              max={100}
              value={form.progress}
              disabled={form.status === 'achieved'}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
              className="w-full accent-[var(--brand-accent)]"
            />
          </FormRow>
          <FormRow label="Target date">
            <input
              type="date"
              className={inputClass}
              value={form.targetDate}
              onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create goal'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
