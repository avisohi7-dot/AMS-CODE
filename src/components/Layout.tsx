import { NavLink, Outlet } from 'react-router-dom'
import {
  Archive,
  Brain,
  CalendarCheck,
  FolderKanban,
  LayoutDashboard,
  Library,
  ListTodo,
  Moon,
  NotebookText,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react'
import { useEffect } from 'react'
import { useBrainStore } from '../store'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/areas', label: 'Areas', icon: Sparkles },
  { to: '/resources', label: 'Resources', icon: Library },
  { to: '/archive', label: 'Archive', icon: Archive },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/notes', label: 'Notes', icon: NotebookText },
  { to: '/habits', label: 'Habits', icon: CalendarCheck },
  { to: '/goals', label: 'Goals', icon: Target },
]

function ThemeToggle() {
  const theme = useBrainStore((s) => s.theme)
  const setTheme = useBrainStore((s) => s.setTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line-border text-ink-secondary hover:bg-surface-plane hover:text-ink-primary"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  )
}

export function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line-border bg-surface-1 px-3 py-4 md:flex">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: 'var(--series-1)' }}
          >
            <Brain size={18} />
          </div>
          <div>
            <div className="text-sm font-semibold leading-tight text-ink-primary">Second Brain</div>
            <div className="text-xs leading-tight text-ink-muted">OS</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-surface-plane text-ink-primary'
                    : 'text-ink-secondary hover:bg-surface-plane hover:text-ink-primary'
                }`
              }
              style={({ isActive }) =>
                isActive ? { boxShadow: 'inset 2px 0 0 var(--series-1)' } : undefined
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex items-center justify-between px-2">
          <span className="text-xs text-ink-muted">Local &amp; private</span>
          <ThemeToggle />
        </div>
      </aside>

      <MobileNav />

      <main className="min-w-0 flex-1 px-4 pb-16 pt-4 md:px-8 md:pb-8 md:pt-8">
        <Outlet />
      </main>
    </div>
  )
}

function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-between border-t border-line-border bg-surface-1 px-1 py-1.5 md:hidden">
      {NAV.slice(0, 5).map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium ${
              isActive ? 'text-ink-primary' : 'text-ink-muted'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
