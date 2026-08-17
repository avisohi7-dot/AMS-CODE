import { useMemo, useState } from 'react'
import { Archive, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { JournalEntry } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'
import { todayISO } from '../lib/id'

const GRID_DAYS = 28

const MOOD_LABEL: Record<number, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
}
const MOOD_COLOR: Record<number, string> = {
  1: 'var(--status-critical)',
  2: 'var(--status-serious)',
  3: 'var(--status-warning)',
  4: 'var(--series-3)',
  5: 'var(--status-good)',
}

function last28Days(): string[] {
  const days: string[] = []
  for (let i = GRID_DAYS - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

function currentStreak(dates: Set<string>): number {
  let streak = 0
  const d = new Date()
  while (true) {
    const iso = d.toISOString().slice(0, 10)
    if (dates.has(iso)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function Habits() {
  const [tab, setTab] = useState<'habits' | 'journal'>('habits')
  return (
    <div>
      <PageHeader
        title="Habits & Journal"
        description="Small daily actions and how they felt."
      />
      <div className="mb-5 inline-flex rounded-lg border border-line-border p-0.5">
        {(['habits', 'journal'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? 'text-white' : 'text-ink-secondary hover:text-ink-primary'
            }`}
            style={tab === t ? { backgroundColor: 'var(--series-1)' } : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'habits' ? <HabitsTab /> : <JournalTab />}
    </div>
  )
}

function HabitsTab() {
  const habits = useBrainStore((s) => s.habits.filter((h) => !h.archived))
  const habitLogs = useBrainStore((s) => s.habitLogs)
  const addHabit = useBrainStore((s) => s.addHabit)
  const toggleHabitLog = useBrainStore((s) => s.toggleHabitLog)
  const archiveHabit = useBrainStore((s) => s.archiveHabit)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const days = useMemo(() => last28Days(), [])
  const today = todayISO()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const colors = ['var(--series-1)', 'var(--series-2)', 'var(--series-3)', 'var(--series-4)', 'var(--series-5)', 'var(--series-7)']
    addHabit({ name: name.trim(), color: colors[habits.length % colors.length] })
    setName('')
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> New habit
        </Button>
      </div>

      {habits.length === 0 ? (
        <EmptyState title="No habits yet" description="Add a habit to start building your daily streak grid." />
      ) : (
        <Card className="overflow-x-auto p-4">
          <div className="min-w-[560px]">
            <div className="mb-2 grid grid-cols-[140px_1fr_70px_70px] items-center gap-2 text-xs font-medium text-ink-muted">
              <span>Habit</span>
              <span>Last 28 days</span>
              <span className="text-right">Streak</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="space-y-2.5">
              {habits.map((h) => {
                const dates = new Set(habitLogs.filter((l) => l.habitId === h.id).map((l) => l.date))
                const streak = currentStreak(dates)
                return (
                  <div key={h.id} className="grid grid-cols-[140px_1fr_70px_70px] items-center gap-2">
                    <span className="truncate text-sm font-medium text-ink-primary">{h.name}</span>
                    <div className="flex gap-[3px]">
                      {days.map((d) => {
                        const logged = dates.has(d)
                        const isToday = d === today
                        return (
                          <button
                            key={d}
                            onClick={() => toggleHabitLog(h.id, d)}
                            title={d}
                            className="h-4 w-4 rounded-[3px] transition-transform hover:scale-110"
                            style={{
                              backgroundColor: logged ? h.color : 'var(--gridline)',
                              outline: isToday ? `1.5px solid ${h.color}` : 'none',
                              outlineOffset: 1,
                            }}
                          />
                        )
                      })}
                    </div>
                    <span className="tabular text-right text-sm font-semibold text-ink-primary">
                      {streak > 0 ? `${streak}d` : '—'}
                    </span>
                    <div className="flex justify-end gap-1">
                      <IconButton label="Archive" onClick={() => archiveHabit(h.id, true)}>
                        <Archive size={13} />
                      </IconButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New habit">
        <form onSubmit={submit}>
          <FormRow label="Habit name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
              placeholder="e.g. Meditate 10 min"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add habit</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

type JournalForm = { date: string; mood: number; content: string }

function JournalTab() {
  const entries = useBrainStore((s) => s.journal)
  const addJournalEntry = useBrainStore((s) => s.addJournalEntry)
  const updateJournalEntry = useBrainStore((s) => s.updateJournalEntry)
  const deleteJournalEntry = useBrainStore((s) => s.deleteJournalEntry)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<JournalForm>({ date: todayISO(), mood: 3, content: '' })

  const sorted = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)), [entries])

  function openCreate() {
    setEditingId(null)
    setForm({ date: todayISO(), mood: 3, content: '' })
    setOpen(true)
  }

  function openEdit(e: JournalEntry) {
    setEditingId(e.id)
    setForm({ date: e.date, mood: e.mood, content: e.content })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.content.trim()) return
    const payload = { date: form.date, mood: form.mood as JournalEntry['mood'], content: form.content.trim() }
    if (editingId) updateJournalEntry(editingId, payload)
    else addJournalEntry(payload)
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> New entry
        </Button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No journal entries yet" description="Reflect on your day — even a few sentences helps." />
      ) : (
        <div className="space-y-3">
          {sorted.map((e) => (
            <Card key={e.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink-primary">
                    {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                    style={{ color: MOOD_COLOR[e.mood], backgroundColor: MOOD_COLOR[e.mood] + '1a' }}
                  >
                    {MOOD_LABEL[e.mood]}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <IconButton label="Edit" onClick={() => openEdit(e)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteJournalEntry(e.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-ink-secondary">{e.content}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit entry' : 'New journal entry'}>
        <form onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Date">
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </FormRow>
            <FormRow label="Mood">
              <select
                className={inputClass}
                value={form.mood}
                onChange={(e) => setForm({ ...form, mood: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5].map((m) => (
                  <option key={m} value={m}>
                    {MOOD_LABEL[m]}
                  </option>
                ))}
              </select>
            </FormRow>
          </div>
          <FormRow label="What happened today?">
            <textarea
              className={inputClass}
              rows={5}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              autoFocus
              required
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Add entry'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
