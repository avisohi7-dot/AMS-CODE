import { useEffect, useMemo, useState } from 'react'
import { useBrainStore } from '../store'
import { Button, Card, PageHeader, StatTile } from '../components/ui'
import {
  currentMonthISO,
  currentWeekStartISO,
  formatMonthLabel,
  formatWeekLabel,
  isDateInMonth,
  isDateInWeek,
} from '../lib/date'

export function Reviews() {
  const [tab, setTab] = useState<'weekly' | 'monthly'>('weekly')
  return (
    <div>
      <PageHeader title="Reviews" description="Zoom out — weekly priorities and a monthly reflection ritual." />
      <div className="mb-5 inline-flex rounded-lg border border-line-border p-0.5">
        {(['weekly', 'monthly'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
              tab === t ? '' : 'text-ink-secondary hover:text-ink-primary'
            }`}
            style={tab === t ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'weekly' ? <WeeklyFocusTab /> : <MonthlyReviewTab />}
    </div>
  )
}

function WeeklyFocusTab() {
  const weekStart = useMemo(() => currentWeekStartISO(), [])
  const weeklyFocus = useBrainStore((s) => s.weeklyFocus)
  const upsertWeeklyFocus = useBrainStore((s) => s.upsertWeeklyFocus)
  const tasks = useBrainStore((s) => s.tasks)
  const habits = useBrainStore((s) => s.habits.filter((h) => !h.archived))
  const habitLogs = useBrainStore((s) => s.habitLogs)

  const current = weeklyFocus.find((w) => w.weekStart === weekStart)
  const [priorities, setPriorities] = useState<string[]>(current?.priorities ?? ['', '', ''])
  const [notes, setNotes] = useState(current?.notes ?? '')

  useEffect(() => {
    setPriorities(current?.priorities ?? ['', '', ''])
    setNotes(current?.notes ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart])

  const weekTasks = tasks.filter((t) => t.dueDate && isDateInWeek(t.dueDate, weekStart))
  const doneCount = weekTasks.filter((t) => t.status === 'done').length

  const possibleLogs = habits.length * 7
  const actualLogs = habitLogs.filter(
    (l) => habits.some((h) => h.id === l.habitId) && isDateInWeek(l.date, weekStart)
  ).length
  const habitRate = possibleLogs ? Math.round((actualLogs / possibleLogs) * 100) : 0

  const past = [...weeklyFocus].filter((w) => w.weekStart !== weekStart).sort((a, b) => (a.weekStart < b.weekStart ? 1 : -1))

  function save() {
    upsertWeeklyFocus(weekStart, { priorities, notes })
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-primary">This week · {formatWeekLabel(weekStart)}</h2>
        </div>
        <p className="mb-2 text-xs font-medium text-ink-muted">Top 3 priorities</p>
        <div className="space-y-2">
          {priorities.map((p, i) => (
            <input
              key={i}
              value={p}
              onChange={(e) => {
                const next = [...priorities]
                next[i] = e.target.value
                setPriorities(next)
              }}
              placeholder={`Priority ${i + 1}`}
              className="w-full rounded-lg border border-line-border bg-surface-1 px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
            />
          ))}
        </div>
        <p className="mb-1 mt-4 text-xs font-medium text-ink-muted">Notes</p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Anything to keep in mind this week…"
          className="w-full rounded-lg border border-line-border bg-surface-1 px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
        />
        <div className="mt-3 flex justify-end">
          <Button onClick={save}>Save week</Button>
        </div>
      </Card>

      <div className="space-y-3">
        <StatTile
          label="Tasks due this week"
          value={`${doneCount}/${weekTasks.length}`}
          hint={weekTasks.length ? `${Math.round((doneCount / weekTasks.length) * 100)}% done` : 'None scheduled'}
          accent="var(--series-2)"
        />
        <StatTile label="Habit completion" value={`${habitRate}%`} accent="var(--series-3)" />
      </div>

      {past.length > 0 && (
        <Card className="p-4 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Past weeks</h2>
          <ul className="space-y-3">
            {past.map((w) => (
              <li key={w.id} className="rounded-lg border border-line-hairline p-3">
                <p className="mb-1 text-xs font-medium text-ink-muted">{formatWeekLabel(w.weekStart)}</p>
                <ul className="list-inside list-disc text-sm text-ink-secondary">
                  {w.priorities.filter(Boolean).map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

function MonthlyReviewTab() {
  const month = useMemo(() => currentMonthISO(), [])
  const monthlyReviews = useBrainStore((s) => s.monthlyReviews)
  const addMonthlyReview = useBrainStore((s) => s.addMonthlyReview)
  const updateMonthlyReview = useBrainStore((s) => s.updateMonthlyReview)
  const projects = useBrainStore((s) => s.projects)
  const goals = useBrainStore((s) => s.goals)
  const journal = useBrainStore((s) => s.journal)
  const habits = useBrainStore((s) => s.habits.filter((h) => !h.archived))
  const habitLogs = useBrainStore((s) => s.habitLogs)

  const current = monthlyReviews.find((r) => r.month === month)
  const [wins, setWins] = useState(current?.wins ?? '')
  const [challenges, setChallenges] = useState(current?.challenges ?? '')
  const [focusNext, setFocusNext] = useState(current?.focusNext ?? '')

  useEffect(() => {
    setWins(current?.wins ?? '')
    setChallenges(current?.challenges ?? '')
    setFocusNext(current?.focusNext ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month])

  const projectsCompleted = projects.filter(
    (p) => p.status === 'done' && p.dueDate && isDateInMonth(p.dueDate, month)
  ).length
  const avgGoalProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
    : 0
  const monthMoods = journal.filter((j) => isDateInMonth(j.date, month))
  const avgMood = monthMoods.length
    ? (monthMoods.reduce((sum, j) => sum + j.mood, 0) / monthMoods.length).toFixed(1)
    : '—'
  const daysSoFar = new Date().getDate()
  const possibleLogs = habits.length * daysSoFar
  const actualLogs = habitLogs.filter(
    (l) => habits.some((h) => h.id === l.habitId) && isDateInMonth(l.date, month)
  ).length
  const habitRate = possibleLogs ? Math.round((actualLogs / possibleLogs) * 100) : 0

  const past = [...monthlyReviews].filter((r) => r.month !== month).sort((a, b) => (a.month < b.month ? 1 : -1))

  function save() {
    if (current) updateMonthlyReview(current.id, { wins, challenges, focusNext })
    else addMonthlyReview({ month, wins, challenges, focusNext })
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="grid grid-cols-2 gap-3 lg:col-span-3 lg:grid-cols-4">
        <StatTile label="Projects completed" value={projectsCompleted} accent="var(--series-1)" />
        <StatTile label="Avg goal progress" value={`${avgGoalProgress}%`} accent="var(--series-7)" />
        <StatTile label="Avg mood" value={avgMood} accent="var(--series-5)" />
        <StatTile label="Habit completion" value={`${habitRate}%`} accent="var(--series-3)" />
      </div>

      <Card className="p-4 lg:col-span-3">
        <h2 className="mb-3 text-sm font-semibold text-ink-primary">{formatMonthLabel(month)}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-medium text-ink-muted">Wins</p>
            <textarea
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-line-border bg-surface-1 px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-ink-muted">Challenges</p>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-line-border bg-surface-1 px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-ink-muted">Focus next month</p>
            <textarea
              value={focusNext}
              onChange={(e) => setFocusNext(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-line-border bg-surface-1 px-3 py-2 text-sm text-ink-primary outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={save}>Save review</Button>
        </div>
      </Card>

      {past.length > 0 && (
        <Card className="p-4 lg:col-span-3">
          <h2 className="mb-3 text-sm font-semibold text-ink-primary">Past reviews</h2>
          <ul className="space-y-3">
            {past.map((r) => (
              <li key={r.id} className="rounded-lg border border-line-hairline p-3">
                <p className="mb-1 text-xs font-medium text-ink-muted">{formatMonthLabel(r.month)}</p>
                <p className="text-sm text-ink-secondary">
                  <span className="font-medium text-ink-primary">Wins:</span> {r.wins || '—'}
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
