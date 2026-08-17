import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Task, TaskPriority, TaskStatus } from '../types'
import {
  Button,
  Card,
  EmptyState,
  IconButton,
  PageHeader,
  PriorityBadge,
  TaskStatusBadge,
  daysUntil,
  fmtDate,
} from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { todayISO } from '../lib/id'

type FormState = {
  title: string
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  dueDate: string
}

const EMPTY_FORM: FormState = {
  title: '',
  status: 'todo',
  priority: 'medium',
  projectId: '',
  dueDate: '',
}

const STATUS_FILTERS: (TaskStatus | 'all')[] = ['all', 'todo', 'in-progress', 'done']
const STATUS_LABEL: Record<TaskStatus | 'all', string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

export function Tasks() {
  const tasks = useBrainStore((s) => s.tasks)
  const projects = useBrainStore((s) => s.projects.filter((p) => !p.archived))
  const addTask = useBrainStore((s) => s.addTask)
  const updateTask = useBrainStore((s) => s.updateTask)
  const deleteTask = useBrainStore((s) => s.deleteTask)
  const cycleTaskStatus = useBrainStore((s) => s.cycleTaskStatus)

  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const today = todayISO()

  const filtered = useMemo(() => {
    const list = statusFilter === 'all' ? tasks : tasks.filter((t) => t.status === statusFilter)
    return [...list].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'done' ? 1 : -1
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate < b.dueDate ? -1 : 1
    })
  }, [tasks, statusFilter])

  const projectTitle = (id: string | null) => projects.find((p) => p.id === id)?.title

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setOpen(true)
  }

  function openEdit(t: Task) {
    setEditingId(t.id)
    setForm({
      title: t.title,
      status: t.status,
      priority: t.priority,
      projectId: t.projectId ?? '',
      dueDate: t.dueDate ?? '',
    })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      status: form.status,
      priority: form.priority,
      projectId: form.projectId || null,
      dueDate: form.dueDate || null,
    }
    if (editingId) updateTask(editingId, payload)
    else addTask(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Everything on your plate — click a task to cycle its status."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New task
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
              statusFilter === s
                ? 'border-transparent text-white'
                : 'border-line-border text-ink-secondary hover:text-ink-primary'
            }`}
            style={statusFilter === s ? { backgroundColor: 'var(--series-1)' } : undefined}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tasks here" description="Add a task to get started." />
      ) : (
        <Card className="divide-y divide-line-hairline">
          {filtered.map((t) => {
            const overdue = t.status !== 'done' && t.dueDate && t.dueDate < today
            const du = daysUntil(t.dueDate)
            return (
              <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <button
                    onClick={() => cycleTaskStatus(t.id)}
                    className={`block truncate text-left text-sm font-medium hover:underline ${
                      t.status === 'done' ? 'text-ink-muted line-through' : 'text-ink-primary'
                    }`}
                    title="Click to advance status"
                  >
                    {t.title}
                  </button>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <TaskStatusBadge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                    {projectTitle(t.projectId) && (
                      <span className="text-xs text-ink-muted">{projectTitle(t.projectId)}</span>
                    )}
                    {t.dueDate && (
                      <span
                        className="tabular text-xs font-medium"
                        style={{ color: overdue ? 'var(--status-critical)' : 'var(--text-muted)' }}
                      >
                        {du === 0 ? 'Today' : overdue ? `${Math.abs(du!)}d overdue` : fmtDate(t.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <IconButton label="Edit" onClick={() => openEdit(t)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteTask(t.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
            )
          })}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit task' : 'New task'}>
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
            <FormRow label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                <option value="todo">To do</option>
                <option value="in-progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </FormRow>
            <FormRow label="Priority">
              <select
                className={inputClass}
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormRow>
          </div>
          <FormRow label="Project (optional)">
            <select
              className={inputClass}
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
            >
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </FormRow>
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
            <Button type="submit">{editingId ? 'Save changes' : 'Create task'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
