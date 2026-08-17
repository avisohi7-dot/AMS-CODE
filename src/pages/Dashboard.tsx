import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useBrainStore } from '../store'
import {
  Card,
  PriorityBadge,
  ProgressBar,
  TaskStatusBadge,
  areaAccent,
  daysUntil,
  fmtDate,
} from '../components/ui'
import { HeroBanner } from '../components/HeroBanner'
import { ClockWidget } from '../components/ClockWidget'
import { FastActions } from '../components/FastActions'
import { todayISO } from '../lib/id'
import { currentWeekStartISO, isDateInWeek } from '../lib/date'
import { LIFE_AREAS } from '../lib/seed'
import type { LifeArea, Task, TaskPriority } from '../types'

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

export function Dashboard() {
  const projects = useBrainStore((s) => s.projects)
  const tasks = useBrainStore((s) => s.tasks)
  const habits = useBrainStore((s) => s.habits.filter((h) => !h.archived))
  const habitLogs = useBrainStore((s) => s.habitLogs)
  const goals = useBrainStore((s) => s.goals.filter((g) => g.status !== 'achieved'))
  const cycleTaskStatus = useBrainStore((s) => s.cycleTaskStatus)

  const today = todayISO()
  const weekStart = useMemo(() => currentWeekStartISO(), [])

  const thisWeekTasks = useMemo(
    () =>
      tasks.filter(
        (t) => t.status !== 'done' && t.dueDate && (isDateInWeek(t.dueDate, weekStart) || t.dueDate < today)
      ),
    [tasks, weekStart, today]
  )

  const projectTitle = (id: string | null) => projects.find((p) => p.id === id)?.title

  return (
    <div>
      <HeroBanner subtitle="Tasks, projects, notes, life areas, habits, and goals — all connected in one workspace." />

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[220px_1fr_280px]">
        <div className="flex flex-col gap-4">
          <ClockWidget />
          <FastActions />
        </div>

        <TasksThisWeekCard tasks={thisWeekTasks} today={today} projectTitle={projectTitle} cycleTaskStatus={cycleTaskStatus} />

        <HabitsTodayCard habits={habits} habitLogs={habitLogs} today={today} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <LifeAreasCard projects={projects} />
        <GoalsThisMonthCard goals={goals} />
      </div>
    </div>
  )
}

type TasksTab = 'all' | 'priority' | 'timeline'

function TasksThisWeekCard({
  tasks,
  today,
  projectTitle,
  cycleTaskStatus,
}: {
  tasks: Task[]
  today: string
  projectTitle: (id: string | null) => string | undefined
  cycleTaskStatus: (id: string) => void
}) {
  const [tab, setTab] = useState<TasksTab>('all')

  const sorted = useMemo(() => {
    const list = [...tasks]
    if (tab === 'priority') {
      list.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.dueDate! < b.dueDate! ? -1 : 1))
    } else {
      list.sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    }
    return list
  }, [tasks, tab])

  function timelineLabel(dueDate: string): string {
    const du = daysUntil(dueDate)!
    if (du < 0) return 'Overdue'
    if (du === 0) return 'Today'
    if (du === 1) return 'Tomorrow'
    return 'This week'
  }

  let lastGroup: string | null = null

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-primary">Tasks this week</h2>
        <Link to="/tasks" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>

      <div className="mb-3 inline-flex rounded-lg border border-line-border p-0.5">
        {(['all', 'priority', 'timeline'] as TasksTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === t ? '' : 'text-ink-secondary hover:text-ink-primary'
            }`}
            style={tab === t ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            {t === 'all' ? 'All' : t === 'priority' ? 'By priority' : 'Timeline'}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-secondary">Nothing due this week — you're clear.</p>
      ) : (
        <ul className="divide-y divide-line-hairline">
          {sorted.map((t) => {
            const overdue = t.dueDate! < today
            const group = tab === 'timeline' ? timelineLabel(t.dueDate!) : null
            const showGroupHeader = tab === 'timeline' && group !== lastGroup
            if (showGroupHeader) lastGroup = group
            return (
              <li key={t.id}>
                {showGroupHeader && (
                  <div className="pt-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                    {group}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <button
                      onClick={() => cycleTaskStatus(t.id)}
                      className="block truncate text-left text-sm font-medium text-ink-primary hover:underline"
                      title="Click to advance status"
                    >
                      {t.title}
                    </button>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
                      <TaskStatusBadge status={t.status} />
                      {projectTitle(t.projectId) && <span>· {projectTitle(t.projectId)}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <PriorityBadge priority={t.priority} />
                    <span
                      className="tabular text-xs font-medium"
                      style={{ color: overdue ? 'var(--status-critical)' : 'var(--text-secondary)' }}
                    >
                      {fmtDate(t.dueDate)}
                    </span>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function HabitsTodayCard({
  habits,
  habitLogs,
  today,
}: {
  habits: { id: string; name: string; color: string }[]
  habitLogs: { habitId: string; date: string }[]
  today: string
}) {
  function weeklyRate(habitId: string): number {
    let count = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const iso = d.toISOString().slice(0, 10)
      if (habitLogs.some((l) => l.habitId === habitId && l.date === iso)) count++
    }
    return Math.round((count / 7) * 100)
  }

  const doneToday = (habitId: string) => habitLogs.some((l) => l.habitId === habitId && l.date === today)

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">Habits today</h2>
        <Link to="/habits" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>
      {habits.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-secondary">No habits yet.</p>
      ) : (
        <ul className="space-y-3">
          {habits.map((h) => (
            <li key={h.id}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 truncate text-sm text-ink-primary">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: doneToday(h.id) ? 'var(--status-good)' : 'var(--baseline)' }}
                  />
                  {h.name}
                </span>
                <span className="tabular shrink-0 text-xs text-ink-secondary">{weeklyRate(h.id)}%</span>
              </div>
              <ProgressBar value={weeklyRate(h.id)} accent={h.color} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function LifeAreasCard({ projects }: { projects: { area: string; archived: boolean; status: string }[] }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">Life areas</h2>
        <Link to="/areas" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {LIFE_AREAS.map((area) => {
          const count = projects.filter((p) => p.area === area && !p.archived && p.status !== 'done').length
          const accent = areaAccent(area)
          return (
            <Link
              key={area}
              to="/areas"
              className="group relative overflow-hidden rounded-xl p-3 text-white transition-transform hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(155deg, ${accent}, color-mix(in srgb, ${accent} 45%, black))`,
              }}
            >
              <div className="text-sm font-semibold">{area}</div>
              <div className="mt-4 text-xs text-white/80">
                {count} active project{count === 1 ? '' : 's'}
              </div>
            </Link>
          )
        })}
      </div>
    </Card>
  )
}

function GoalsThisMonthCard({
  goals,
}: {
  goals: { id: string; title: string; area: LifeArea; progress: number }[]
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">Goals this month</h2>
        <Link to="/goals" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>
      {goals.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-secondary">No active goals.</p>
      ) : (
        <ul className="space-y-3">
          {goals.slice(0, 6).map((g) => (
            <li key={g.id}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-ink-primary">{g.title}</span>
                <span className="tabular shrink-0 text-xs text-ink-secondary">{g.progress}%</span>
              </div>
              <ProgressBar value={g.progress} accent={areaAccent(g.area)} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
