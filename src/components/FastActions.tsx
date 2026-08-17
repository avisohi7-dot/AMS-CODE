import { useNavigate } from 'react-router-dom'
import { FolderPlus, ListPlus, NotebookPen, Target, CalendarPlus } from 'lucide-react'
import { Card } from './ui'

const ACTIONS = [
  { label: 'New task', to: '/tasks?new=1', icon: ListPlus },
  { label: 'New note', to: '/notes?new=1', icon: NotebookPen },
  { label: 'New project', to: '/projects?new=1', icon: FolderPlus },
  { label: 'New habit', to: '/habits?new=1', icon: CalendarPlus },
  { label: 'New goal', to: '/goals?new=1', icon: Target },
]

export function FastActions() {
  const navigate = useNavigate()
  return (
    <Card className="p-4">
      <h2 className="mb-3 text-sm font-semibold text-ink-primary">Fast actions</h2>
      <div className="flex flex-col gap-1.5">
        {ACTIONS.map(({ label, to, icon: Icon }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="flex items-center gap-2.5 rounded-lg border border-line-border px-3 py-2 text-left text-sm font-medium text-ink-secondary transition-colors hover:border-accent hover:text-ink-primary"
          >
            <Icon size={15} style={{ color: 'var(--brand-accent)' }} />
            {label}
          </button>
        ))}
      </div>
    </Card>
  )
}
