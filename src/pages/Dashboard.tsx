import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { NotebookText } from 'lucide-react'
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
import { PomodoroWidget } from '../components/PomodoroWidget'
import { ActiveProjectsWidget } from '../components/ActiveProjectsWidget'
import { WatchingReadingWidget } from '../components/WatchingReadingWidget'
import { todayISO } from '../lib/id'
import { currentWeekStartISO, isDateInWeek } from '../lib/date'
import { LIFE_AREAS } from '../lib/seed'
import type { Habit, HabitLog, LifeArea, Task, TaskPriority } from '../types'

const PRIORITY_RANK: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 }

export function Dashboard() {
  const projects = useBrainStore((s) => s.projects)
  const tasks = useBrainStore((s) => s.tasks)
  const habits = useBrainStore((s) => s.habits.filter((h) => !h.archived))
  const habitLogs = useBrainStore((s) => s.habitLogs)
  const goals = useBrainStore((s) => s.goals.filter((g) => g.status !== 'achieved'))
  const goalsAll = useBrainStore((s) => s.goals)
  const notes = useBrainStore((s) => s.notes)
  const cycleTaskStatus = useBrainStore((s) => s.cycleTaskStatus)
  const toggleHabitLog = useBrainStore((s) => s.toggleHabitLog)

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

  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 5),
    [notes]
  )

  return (
    <div>
      <HeroBanner subtitle="Tasks, projects, notes, life areas, habits, and goals — all connected in one workspace." />

      <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[220px_1fr_280px]">
        <div className="flex flex-col gap-4">
          <ClockWidget />
          <FastActions />
        </div>

        <TasksThisWeekCard tasks={thisWeekTasks} today={today} projectTitle={projectTitle} cycleTaskStatus={cycleTaskStatus} />

        <HabitsTodayCard habits={habits} habitLogs={habitLogs} today={today} toggleHabitLog={toggleHabitLog} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <LifeAreasCard projects={projects} goals={goalsAll} tasks={tasks} />
        <GoalsThisMonthCard goals={goals} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <ActiveProjectsWidget />
        <PomodoroWidget />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_280px]">
        <WatchingReadingWidget />
        <RecentNotesCard notes={recentNotes} />
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
  toggleHabitLog,
}: {
  habits: Habit[]
  habitLogs: HabitLog[]
  today: string
  toggleHabitLog: (habitId: string, date: string) => void
}) {
  const doneToday = (habitId: string) => habitLogs.some((l) => l.habitId === habitId && l.date === today)
  const completedCount = habits.filter((h) => doneToday(h.id)).length
  const pct = habits.length ? Math.round((completedCount / habits.length) * 100) : 0

  return (
    <Card className="p-4">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">Habits today</h2>
        <Link to="/habits" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <span className="tabular text-xs text-ink-secondary">
          {completedCount}/{habits.length} · {pct}%
        </span>
      </div>
      <ProgressBar value={pct} accent="var(--status-good)" />
      {habits.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-secondary">No habits yet.</p>
      ) : (
        <ul className="mt-3 space-y-1">
          {habits.map((h) => {
            const checked = doneToday(h.id)
            return (
              <li key={h.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-surface-plane">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleHabitLog(h.id, today)}
                    className="h-4 w-4 accent-[var(--brand-accent)]"
                  />
                  <span className={`truncate text-sm ${checked ? 'text-ink-muted line-through' : 'text-ink-primary'}`}>
                    {h.name}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}

function LifeAreasCard({
  projects,
  goals,
  tasks,
}: {
  projects: { area: string; archived: boolean; status: string; id: string }[]
  goals: { area: string }[]
  tasks: { projectId: string | null; status: string }[]
}) {
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
          const areaProjects = projects.filter((p) => p.area === area && !p.archived)
          const activeProjects = areaProjects.filter((p) => p.status !== 'done')
          const goalCount = goals.filter((g) => g.area === area).length
          const taskCount = tasks.filter(
            (t) => t.status !== 'done' && areaProjects.some((p) => p.id === t.projectId)
          ).length
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
              <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] text-white/85">
                <span>Goals: {goalCount}</span>
                <span>Projects: {activeProjects.length}</span>
                <span>Tasks: {taskCount}</span>
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

function RecentNotesCard({ notes }: { notes: { id: string; title: string; content: string }[] }) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-primary">Recent notes</h2>
        <Link to="/notes" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>
      {notes.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-secondary">No notes yet.</p>
      ) : (
        <ul className="space-y-1">
          {notes.map((n) => (
            <li key={n.id}>
              <Link
                to="/notes"
                className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-surface-plane"
              >
                <NotebookText size={14} className="shrink-0 text-ink-muted" />
                <span className="truncate text-sm text-ink-primary">{n.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
