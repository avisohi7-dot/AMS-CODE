import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useBrainStore } from '../store'
import type { ProjectStatus } from '../types'
import { AreaPill, Card, ProgressBar, areaAccent, fmtDate } from './ui'

const TABS: { key: ProjectStatus; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'on-hold', label: 'On hold' },
  { key: 'done', label: 'Done' },
]

export function ActiveProjectsWidget() {
  const [tab, setTab] = useState<ProjectStatus>('active')
  const projects = useBrainStore((s) => s.projects.filter((p) => !p.archived))
  const tasks = useBrainStore((s) => s.tasks)

  const filtered = useMemo(() => projects.filter((p) => p.status === tab), [projects, tab])

  function taskProgress(projectId: string) {
    const projectTasks = tasks.filter((t) => t.projectId === projectId)
    const done = projectTasks.filter((t) => t.status === 'done').length
    return { done, total: projectTasks.length }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink-primary">Active projects</h2>
        <Link to="/projects" className="text-xs font-medium" style={{ color: 'var(--brand-accent)' }}>
          View all
        </Link>
      </div>

      <div className="mb-3 inline-flex rounded-lg border border-line-border p-0.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              tab === key ? '' : 'text-ink-secondary hover:text-ink-primary'
            }`}
            style={tab === key ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-secondary">No {TABS.find((t) => t.key === tab)?.label.toLowerCase()} projects.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((p) => {
            const { done, total } = taskProgress(p.id)
            return (
              <Link
                key={p.id}
                to="/projects"
                className="block overflow-hidden rounded-lg border border-line-hairline transition-colors hover:border-accent"
              >
                <div
                  className="h-14"
                  style={{
                    background: `linear-gradient(155deg, ${areaAccent(p.area)}, color-mix(in srgb, ${areaAccent(p.area)} 35%, black))`,
                  }}
                />
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium text-ink-primary">{p.title}</span>
                    <AreaPill area={p.area} />
                  </div>
                  {total > 0 && (
                    <div className="mt-2">
                      <div className="mb-1 flex items-center justify-between text-xs text-ink-secondary">
                        <span>
                          {done}/{total} tasks
                        </span>
                        <span>{p.dueDate ? fmtDate(p.dueDate) : 'No due date'}</span>
                      </div>
                      <ProgressBar value={total ? (done / total) * 100 : 0} accent={areaAccent(p.area)} />
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </Card>
  )
}
