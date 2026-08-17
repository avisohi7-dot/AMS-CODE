import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBrainStore } from '../store'
import { Card, PageHeader, areaAccent } from '../components/ui'
import { currentMonthISO, formatMonthLabel, monthGrid, shiftMonth } from '../lib/date'
import { todayISO } from '../lib/id'

type CalTab = 'tasks' | 'projects' | 'habits' | 'notes'

const TABS: { key: CalTab; label: string }[] = [
  { key: 'tasks', label: 'Tasks' },
  { key: 'projects', label: 'Projects' },
  { key: 'habits', label: 'Habits' },
  { key: 'notes', label: 'Notes' },
]

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface DayEvent {
  id: string
  label: string
  color: string
}

export function Calendar() {
  const [month, setMonth] = useState(() => currentMonthISO())
  const [tab, setTab] = useState<CalTab>('tasks')

  const tasks = useBrainStore((s) => s.tasks)
  const projects = useBrainStore((s) => s.projects.filter((p) => !p.archived))
  const habits = useBrainStore((s) => s.habits.filter((h) => !h.archived))
  const habitLogs = useBrainStore((s) => s.habitLogs)
  const notes = useBrainStore((s) => s.notes)

  const today = todayISO()
  const days = useMemo(() => monthGrid(month), [month])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, DayEvent[]>()
    function push(date: string, ev: DayEvent) {
      if (!map.has(date)) map.set(date, [])
      map.get(date)!.push(ev)
    }

    if (tab === 'tasks') {
      for (const t of tasks) {
        if (!t.dueDate) continue
        push(t.dueDate, {
          id: t.id,
          label: t.title,
          color: t.status === 'done' ? 'var(--status-good)' : t.priority === 'high' ? 'var(--status-critical)' : 'var(--brand-accent)',
        })
      }
    } else if (tab === 'projects') {
      for (const p of projects) {
        if (!p.dueDate) continue
        push(p.dueDate, { id: p.id, label: p.title, color: areaAccent(p.area) })
      }
    } else if (tab === 'habits') {
      for (const l of habitLogs) {
        const habit = habits.find((h) => h.id === l.habitId)
        if (!habit) continue
        push(l.date, { id: l.id, label: habit.name, color: habit.color })
      }
    } else if (tab === 'notes') {
      for (const n of notes) {
        const date = n.createdAt.slice(0, 10)
        push(date, { id: n.id, label: n.title, color: 'var(--series-7)' })
      }
    }
    return map
  }, [tab, tasks, projects, habits, habitLogs, notes])

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Plan your schedule and see everything in one view."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-line-border p-0.5">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === key ? '' : 'text-ink-secondary hover:text-ink-primary'
              }`}
              style={tab === key ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-border text-ink-secondary hover:text-ink-primary"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-[9rem] text-center text-sm font-semibold text-ink-primary">
            {formatMonthLabel(month)}
          </span>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-border text-ink-secondary hover:text-ink-primary"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => setMonth(currentMonthISO())}
            className="rounded-lg border border-line-border px-2.5 py-1.5 text-xs font-medium text-ink-secondary hover:text-ink-primary"
          >
            Today
          </button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line-hairline">
          {WEEKDAYS.map((w) => (
            <div key={w} className="border-r border-line-hairline p-2 text-center text-xs font-medium text-ink-muted last:border-r-0">
              {w}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 overflow-x-auto">
          {days.map((date) => {
            const inMonth = date.slice(0, 7) === month
            const isToday = date === today
            const events = eventsByDate.get(date) ?? []
            const dayNum = Number(date.slice(8, 10))
            return (
              <div
                key={date}
                className="min-h-[92px] border-b border-r border-line-hairline p-1.5 last:border-r-0 [&:nth-child(7n)]:border-r-0"
                style={{ opacity: inMonth ? 1 : 0.4 }}
              >
                <span
                  className={`tabular inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                    isToday ? 'font-semibold' : 'text-ink-secondary'
                  }`}
                  style={isToday ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
                >
                  {dayNum}
                </span>
                <div className="mt-1 space-y-0.5">
                  {events.slice(0, 3).map((ev) => (
                    <div
                      key={ev.id}
                      title={ev.label}
                      className="truncate rounded px-1 py-0.5 text-[10px] font-medium text-white"
                      style={{ backgroundColor: ev.color }}
                    >
                      {ev.label}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="px-1 text-[10px] text-ink-muted">+{events.length - 3} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
