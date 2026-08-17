import { useMemo, useState } from 'react'
import { Archive, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { LifeArea, Project, ProjectStatus } from '../types'
import {
  AreaPill,
  Button,
  Card,
  EmptyState,
  IconButton,
  PageHeader,
  fmtDate,
} from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { LIFE_AREAS } from '../lib/seed'

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  'on-hold': 'On hold',
  done: 'Done',
}

type FormState = {
  title: string
  description: string
  area: LifeArea
  status: ProjectStatus
  dueDate: string
}

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  area: 'Career',
  status: 'active',
  dueDate: '',
}

export function Projects() {
  const projects = useBrainStore((s) => s.projects.filter((p) => !p.archived))
  const addProject = useBrainStore((s) => s.addProject)
  const updateProject = useBrainStore((s) => s.updateProject)
  const deleteProject = useBrainStore((s) => s.deleteProject)
  const archiveProject = useBrainStore((s) => s.archiveProject)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const grouped = useMemo(() => {
    const g: Record<ProjectStatus, Project[]> = { active: [], 'on-hold': [], done: [] }
    for (const p of projects) g[p.status].push(p)
    return g
  }, [projects])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(p: Project) {
    setEditingId(p.id)
    setForm({
      title: p.title,
      description: p.description,
      area: p.area,
      status: p.status,
      dueDate: p.dueDate ?? '',
    })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      area: form.area,
      status: form.status,
      dueDate: form.dueDate || null,
    }
    if (editingId) updateProject(editingId, payload)
    else addProject(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Projects"
        description="Short-term efforts with a clear goal and deadline."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New project
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState title="No projects yet" description="Create your first project to start tracking outcomes." />
      ) : (
        <div className="space-y-6">
          {(['active', 'on-hold', 'done'] as ProjectStatus[]).map((status) =>
            grouped[status].length === 0 ? null : (
              <div key={status}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {STATUS_LABEL[status]} · {grouped[status].length}
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {grouped[status].map((p) => (
                    <Card key={p.id} className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-ink-primary">{p.title}</h3>
                        <AreaPill area={p.area} />
                      </div>
                      {p.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-ink-secondary">{p.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-ink-muted">
                          {p.dueDate ? `Due ${fmtDate(p.dueDate)}` : 'No due date'}
                        </span>
                        <div className="flex gap-1.5">
                          <IconButton label="Edit" onClick={() => openEdit(p)}>
                            <Pencil size={14} />
                          </IconButton>
                          <IconButton label="Archive" onClick={() => archiveProject(p.id, true)}>
                            <Archive size={14} />
                          </IconButton>
                          <IconButton label="Delete" danger onClick={() => deleteProject(p.id)}>
                            <Trash2 size={14} />
                          </IconButton>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit project' : 'New project'}>
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
          <FormRow label="Description">
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
              >
                <option value="active">Active</option>
                <option value="on-hold">On hold</option>
                <option value="done">Done</option>
              </select>
            </FormRow>
          </div>
          <FormRow label="Due date">
            <input
              type="date"
              className={inputClass}
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create project'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
