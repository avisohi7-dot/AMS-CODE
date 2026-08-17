import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useBrainStore } from '../store'
import {
  AreaPill,
  Card,
  PageHeader,
  PriorityBadge,
  ProgressBar,
  StatTile,
  TaskStatusBadge,
  areaAccent,
  daysUntil,
  fmtDate,
} from '../components/ui'
import { todayISO } from '../lib/id'

export function Dashboard() {
  const projects = useBrainStore((s) => s.projects)
  const tasks = useBrainStore((s) => s.tasks)
  const notes = useBrainStore((s) => s.notes)
  const habits = useBrainStore((s) => s.habits)
  const habitLogs = useBrainStore((s) => s.habitLogs)
  const goals = useBrainStore((s) => s.goals)
  const cycleTaskStatus = useBrainStore((s) => s.cycleTaskStatus)

  const activeProjects = projects.filter((p) => !p.archived && p.status !== 'done')
  const openTasks = tasks.filter((t) => t.status !== 'done')
  const today = todayISO()
  const dueTodayOrOverdue = tasks.filter(
    (t) => t.status !== 'done' && t.dueDate && t.dueDate <= today
  )

  const todayLogsCount = habitLogs.filter((l) => l.date === today).length
  const habitCompletion = habits.length
    ? Math.round((todayLogsCount / habits.length) * 100)
    : 0

  const upcomingTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status !== 'done' && t.dueDate)
        .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
        .slice(0, 6),
    [tasks]
  )

  const recentNotes = useMemo(
    () => [...notes].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, 4),
    [notes]
  )

  const activeGoals = goals.filter((g) => g.status !== 'achieved').slice(0, 5)

  const projectTitle = (id: string | null) => projects.find((p) => p.id === id)?.title

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your second brain, at a glance — projects, tasks, habits, and goals in one place."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Active projects" value={activeProjects.length} accent="var(--series-1)" />
        <StatTile
          label="Open tasks"
          value={openTasks.length}
          hint={dueTodayOrOverdue.length ? `${dueTodayOrOverdue.length} due or overdue` : 'All caught up'}
          accent="var(--series-2)"
        />
        <StatTile
          label="Habits today"
          value={`${todayLogsCount}/${habits.length}`}
          hint={`${habitCompletion}% complete`}
          accent="var(--series-3)"
        />
        <StatTile label="Notes captured" value={notes.length} accent="var(--series-7)" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">Due soon</h2>
            <Link to="/tasks" className="text-xs font-medium" style={{ color: 'var(--series-1)' }}>
              View all tasks
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-secondary">Nothing due — you're clear.</p>
          ) : (
            <ul className="divide-y divide-line-hairline">
              {upcomingTasks.map((t) => {
                const overdue = t.dueDate && t.dueDate < today
                const du = daysUntil(t.dueDate)
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 py-2.5">
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
                        {du === 0 ? 'Today' : overdue ? `${Math.abs(du!)}d overdue` : fmtDate(t.dueDate)}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">Goal progress</h2>
            <Link to="/goals" className="text-xs font-medium" style={{ color: 'var(--series-1)' }}>
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {activeGoals.map((g) => (
              <li key={g.id}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-ink-primary">{g.title}</span>
                  <span className="tabular shrink-0 text-xs text-ink-secondary">{g.progress}%</span>
                </div>
                <ProgressBar value={g.progress} accent={areaAccent(g.area)} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">Active projects</h2>
            <Link to="/projects" className="text-xs font-medium" style={{ color: 'var(--series-1)' }}>
              View all
            </Link>
          </div>
          {activeProjects.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-secondary">No active projects.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {activeProjects.slice(0, 4).map((p) => (
                <li key={p.id} className="rounded-lg border border-line-hairline p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-ink-primary">{p.title}</span>
                    <AreaPill area={p.area} />
                  </div>
                  <p className="mt-1 text-xs text-ink-secondary">
                    {p.dueDate ? `Due ${fmtDate(p.dueDate)}` : 'No due date'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-primary">Recent notes</h2>
            <Link to="/notes" className="text-xs font-medium" style={{ color: 'var(--series-1)' }}>
              View all
            </Link>
          </div>
          <ul className="space-y-2">
            {recentNotes.map((n) => (
              <li key={n.id} className="rounded-lg border border-line-hairline p-2.5">
                <p className="truncate text-sm font-medium text-ink-primary">{n.title}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-secondary">{n.content}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
