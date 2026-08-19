import { useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Assignment, AssignmentType, Course } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader, ProgressBar, TaskStatusBadge, fmtDate } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'

const ASSIGNMENT_TYPES: AssignmentType[] = ['Assignment', 'Project', 'Research', 'Homework']

export function Courses() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const courses = useBrainStore((s) => s.courses.filter((c) => !c.archived))
  const selected = courses.find((c) => c.id === selectedId) ?? null

  return selected ? (
    <CourseDetail course={selected} onBack={() => setSelectedId(null)} />
  ) : (
    <CoursesGrid onSelect={setSelectedId} />
  )
}

function CoursesGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const courses = useBrainStore((s) => s.courses.filter((c) => !c.archived))
  const courseTasks = useBrainStore((s) => s.courseTasks)
  const addCourse = useBrainStore((s) => s.addCourse)
  const updateCourse = useBrainStore((s) => s.updateCourse)
  const deleteCourse = useBrainStore((s) => s.deleteCourse)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', semester: '', teacher: '', studentId: '' })

  function openCreate() {
    setEditingId(null)
    setForm({ title: '', semester: '', teacher: '', studentId: '' })
    setOpen(true)
  }

  function openEdit(course: Course) {
    setEditingId(course.id)
    setForm({ title: course.title, semester: course.semester, teacher: course.teacher, studentId: course.studentId })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      semester: form.semester.trim(),
      teacher: form.teacher.trim(),
      studentId: form.studentId.trim(),
    }
    if (editingId) updateCourse(editingId, payload)
    else addCourse(payload)
    setOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Courses"
        description="Your classes this semester, with tasks and assignments for each."
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> New course
          </Button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState title="No courses yet" description="Add the classes you're taking this semester." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => {
            const tasks = courseTasks.filter((t) => t.courseId === course.id)
            const done = tasks.filter((t) => t.done).length
            const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0
            return (
              <Card key={course.id} className="overflow-hidden">
                <button onClick={() => onSelect(course.id)} className="block w-full text-left">
                  <div
                    className="flex h-20 items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: 'linear-gradient(155deg, var(--brand-accent), color-mix(in srgb, var(--brand-accent) 40%, black))',
                    }}
                  >
                    {course.title.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-ink-primary">{course.title}</h3>
                    <p className="mt-0.5 truncate text-xs text-ink-secondary">{course.semester || 'No semester set'}</p>
                    <div className="mt-2">
                      <ProgressBar value={progress} accent="var(--status-good)" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-ink-muted">
                      <span className="truncate">{course.teacher || 'No teacher set'}</span>
                      <span className="tabular">
                        {done}/{tasks.length}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex justify-end gap-1.5 border-t border-line-hairline p-2">
                  <IconButton label="Edit" onClick={() => openEdit(course)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteCourse(course.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit course' : 'New course'}>
        <form onSubmit={submit}>
          <FormRow label="Course name">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Physics"
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Semester">
              <input
                className={inputClass}
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                placeholder="e.g. 6th semester"
              />
            </FormRow>
            <FormRow label="Teacher">
              <input
                className={inputClass}
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                placeholder="e.g. Robin Jersey"
              />
            </FormRow>
          </div>
          <FormRow label="Student ID">
            <input
              className={inputClass}
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              placeholder="e.g. KRA33333"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create course'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CourseDetail({ course, onBack }: { course: Course; onBack: () => void }) {
  const courseTasks = useBrainStore((s) => s.courseTasks.filter((t) => t.courseId === course.id))
  const addCourseTask = useBrainStore((s) => s.addCourseTask)
  const toggleCourseTask = useBrainStore((s) => s.toggleCourseTask)
  const deleteCourseTask = useBrainStore((s) => s.deleteCourseTask)

  const assignments = useBrainStore((s) => s.assignments.filter((a) => a.courseId === course.id))
  const addAssignment = useBrainStore((s) => s.addAssignment)
  const cycleAssignmentStatus = useBrainStore((s) => s.cycleAssignmentStatus)
  const deleteAssignment = useBrainStore((s) => s.deleteAssignment)

  const [taskTitle, setTaskTitle] = useState('')
  const [assignmentOpen, setAssignmentOpen] = useState(false)
  const [assignmentForm, setAssignmentForm] = useState<{ title: string; type: AssignmentType; dueDate: string }>({
    title: '',
    type: 'Assignment',
    dueDate: '',
  })

  const done = courseTasks.filter((t) => t.done).length
  const progress = courseTasks.length ? Math.round((done / courseTasks.length) * 100) : 0

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    if (!taskTitle.trim()) return
    addCourseTask({ courseId: course.id, title: taskTitle.trim() })
    setTaskTitle('')
  }

  function submitAssignment(e: React.FormEvent) {
    e.preventDefault()
    if (!assignmentForm.title.trim()) return
    addAssignment({
      courseId: course.id,
      title: assignmentForm.title.trim(),
      type: assignmentForm.type,
      status: 'todo',
      dueDate: assignmentForm.dueDate || null,
    })
    setAssignmentForm({ title: '', type: 'Assignment', dueDate: '' })
    setAssignmentOpen(false)
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft size={15} /> Back to courses
      </button>
      <PageHeader
        title={course.title}
        description={[course.semester, course.teacher, course.studentId].filter(Boolean).join(' — ') || 'No details set'}
      />

      <Card className="mb-6 p-4">
        <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
          <span>Tasks this week</span>
          <span className="tabular">{progress}%</span>
        </div>
        <ProgressBar value={progress} accent="var(--status-good)" />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Tasks this week</h2>
          <form onSubmit={submitTask} className="mb-3 flex gap-2">
            <input
              className={inputClass}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add a task…"
            />
            <Button type="submit">
              <Plus size={16} />
            </Button>
          </form>
          {courseTasks.length === 0 ? (
            <EmptyState title="No tasks yet" description="Add what needs doing for this course this week." />
          ) : (
            <Card className="divide-y divide-line-hairline">
              {courseTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-3 p-3.5">
                  <label className="flex min-w-0 flex-1 items-center gap-3">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleCourseTask(t.id)}
                      className="h-4 w-4 accent-[var(--brand-accent)]"
                    />
                    <span className={`truncate text-sm ${t.done ? 'text-ink-muted line-through' : 'text-ink-primary'}`}>
                      {t.title}
                    </span>
                  </label>
                  <IconButton label="Delete" danger onClick={() => deleteCourseTask(t.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">Assignments this week</h2>
            <Button variant="secondary" onClick={() => setAssignmentOpen(true)}>
              <Plus size={16} /> Add
            </Button>
          </div>
          {assignments.length === 0 ? (
            <EmptyState title="No assignments yet" description="Track what's due for this course." />
          ) : (
            <Card className="divide-y divide-line-hairline">
              {assignments.map((a) => (
                <AssignmentRow key={a.id} assignment={a} onCycle={() => cycleAssignmentStatus(a.id)} onDelete={() => deleteAssignment(a.id)} />
              ))}
            </Card>
          )}
        </div>
      </div>

      <Modal open={assignmentOpen} onClose={() => setAssignmentOpen(false)} title="New assignment">
        <form onSubmit={submitAssignment}>
          <FormRow label="Title">
            <input
              className={inputClass}
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Research analysis"
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Type">
              <select
                className={inputClass}
                value={assignmentForm.type}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, type: e.target.value as AssignmentType })}
              >
                {ASSIGNMENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormRow>
            <FormRow label="Due date">
              <input
                type="date"
                className={inputClass}
                value={assignmentForm.dueDate}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
              />
            </FormRow>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAssignmentOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add assignment</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function AssignmentRow({
  assignment,
  onCycle,
  onDelete,
}: {
  assignment: Assignment
  onCycle: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink-primary">{assignment.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="rounded-full border border-line-border px-2 py-0.5 text-[10px] text-ink-secondary">
            {assignment.type}
          </span>
          <span className="text-xs text-ink-muted">{fmtDate(assignment.dueDate)}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onCycle} title="Click to change status">
          <TaskStatusBadge status={assignment.status} />
        </button>
        <IconButton label="Delete" danger onClick={onDelete}>
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  )
}
