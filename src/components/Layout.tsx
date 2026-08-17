import { NavLink, Outlet } from 'react-router-dom'
import {
  Archive,
  Brain,
  CalendarCheck,
  CalendarRange,
  FolderKanban,
  Inbox as InboxIcon,
  LayoutDashboard,
  Library,
  ListTodo,
  Moon,
  NotebookText,
  PlayCircle,
  Sparkles,
  Sun,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useBrainStore } from '../store'
import { QuickCaptureModal } from './QuickCapture'

const NAV_GROUPS: { label: string; items: { to: string; label: string; icon: LucideIcon; end?: boolean; badge?: boolean }[] }[] = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/inbox', label: 'Inbox', icon: InboxIcon, badge: true },
      { to: '/reviews', label: 'Reviews', icon: CalendarRange },
    ],
  },
  {
    label: 'PARA',
    items: [
      { to: '/projects', label: 'Projects', icon: FolderKanban },
      { to: '/areas', label: 'Areas', icon: Sparkles },
      { to: '/resources', label: 'Resources', icon: Library },
      { to: '/archive', label: 'Archive', icon: Archive },
    ],
  },
  {
    label: 'Do',
    items: [
      { to: '/tasks', label: 'Tasks', icon: ListTodo },
      { to: '/habits', label: 'Habits', icon: CalendarCheck },
      { to: '/goals', label: 'Goals', icon: Target },
    ],
  },
  {
    label: 'Know',
    items: [
      { to: '/notes', label: 'Notes', icon: NotebookText },
      { to: '/media', label: 'Reading & Watching', icon: PlayCircle },
    ],
  },
  {
    label: 'Money',
    items: [{ to: '/finance', label: 'Finance', icon: Wallet }],
  },
]

const MOBILE_NAV = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/inbox', label: 'Inbox', icon: InboxIcon },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/habits', label: 'Habits', icon: CalendarCheck },
  { to: '/finance', label: 'Finance', icon: Wallet },
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
  const inboxCount = useBrainStore((s) => s.inbox.length)
  const addInboxItem = useBrainStore((s) => s.addInboxItem)
  const [captureOpen, setCaptureOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if (!typing && e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        setCaptureOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line-border bg-surface-1 px-3 py-4 md:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
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

        <button
          type="button"
          onClick={() => setCaptureOpen(true)}
          className="mb-4 flex items-center justify-between rounded-lg border border-dashed border-line-border px-2.5 py-2 text-sm text-ink-secondary transition-colors hover:border-solid hover:text-ink-primary"
          title="Quick capture (press C)"
        >
          <span>Quick capture…</span>
          <kbd className="rounded border border-line-border px-1.5 py-0.5 text-[10px] text-ink-muted">C</kbd>
        </button>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                {group.label}
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map(({ to, label, icon: Icon, end, badge }) => (
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
                    <span className="flex-1 truncate">{label}</span>
                    {badge && inboxCount > 0 && (
                      <span
                        className="tabular rounded-full px-1.5 py-0.5 text-[10px] font-semibold text-white"
                        style={{ backgroundColor: 'var(--series-2)' }}
                      >
                        {inboxCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
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

      <QuickCaptureModal
        open={captureOpen}
        onClose={() => setCaptureOpen(false)}
        onSubmit={(content) => addInboxItem(content)}
      />
    </div>
  )
}

function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-between border-t border-line-border bg-surface-1 px-1 py-1.5 md:hidden">
      {MOBILE_NAV.map(({ to, label, icon: Icon, end }) => (
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
