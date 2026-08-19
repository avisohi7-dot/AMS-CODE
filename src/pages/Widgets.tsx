import { useEffect, useState, type ReactNode } from 'react'
import { Music, Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import { useBrainStore } from '../store'
import { Button, PageHeader } from '../components/ui'
import { selectTasksToday, selectWorkoutToday } from '../lib/widgetSelectors'
import { getPlaybackState, pause as spotifyPause, play as spotifyPlay, skipNext, skipPrevious, type SpotifyPlaybackState } from '../lib/spotify'

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--status-critical)',
  medium: 'var(--status-warning)',
  low: 'var(--text-muted)',
}

function MacWidgetCard({
  size = 'small',
  title,
  children,
}: {
  size?: 'small' | 'medium'
  title: string
  children: ReactNode
}) {
  return (
    <div
      className={`flex shrink-0 flex-col rounded-[22px] border border-line-border p-4 shadow-lg ${
        size === 'medium' ? 'w-full max-w-[300px]' : 'w-full max-w-[220px]'
      }`}
      style={{
        background:
          'linear-gradient(160deg, var(--surface-1), color-mix(in srgb, var(--brand-accent) 8%, var(--surface-1)))',
      }}
    >
      <p className="mb-2 text-[13px] font-semibold text-ink-primary">{title}</p>
      <div className="max-h-[300px] overflow-y-auto">{children}</div>
    </div>
  )
}

function TasksWidgetPreview() {
  const tasks = useBrainStore((s) => s.tasks)
  const updateTask = useBrainStore((s) => s.updateTask)
  const tasksToday = selectTasksToday(tasks)

  return (
    <MacWidgetCard size="medium" title="Today's Tasks">
      {tasksToday.length === 0 ? (
        <p className="text-xs text-ink-muted">Nothing due today</p>
      ) : (
        <ul className="space-y-1.5">
          {tasksToday.slice(0, 5).map((t) => (
            <li key={t.id}>
              <label className="flex cursor-pointer items-start gap-2">
                <input
                  type="checkbox"
                  checked={t.status === 'done'}
                  onChange={() => updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' })}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--brand-accent)]"
                />
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: PRIORITY_COLOR[t.priority], marginTop: 5 }}
                />
                <span
                  className={`truncate text-[12px] leading-tight ${
                    t.status === 'done' ? 'text-ink-muted line-through' : 'text-ink-secondary'
                  }`}
                >
                  {t.title}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </MacWidgetCard>
  )
}

function WorkoutWidgetPreview() {
  const workoutDays = useBrainStore((s) => s.workoutDays)
  const exercises = useBrainStore((s) => s.exercises)
  const toggleExercise = useBrainStore((s) => s.toggleExercise)

  const day = selectWorkoutToday(workoutDays)
  const dayExercises = day ? exercises.filter((e) => e.workoutDayId === day.id) : []

  return (
    <MacWidgetCard size="small" title={day ? day.name : 'Rest Day'}>
      {!day ? (
        <p className="text-xs text-ink-muted">No workout scheduled today</p>
      ) : (
        <ul className="space-y-1.5">
          {dayExercises.slice(0, 4).map((ex) => (
            <li key={ex.id}>
              <label className="flex cursor-pointer items-start gap-1.5">
                <input
                  type="checkbox"
                  checked={ex.done}
                  onChange={() => toggleExercise(ex.id)}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--brand-accent)]"
                />
                <span
                  className={`truncate text-[11px] leading-tight ${
                    ex.done ? 'text-ink-muted line-through' : 'text-ink-secondary'
                  }`}
                >
                  {ex.name} — {ex.sets}×{ex.reps}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </MacWidgetCard>
  )
}

function MealsWidgetPreview() {
  const meals = useBrainStore((s) => s.meals)
  const foodItems = useBrainStore((s) => s.foodItems)
  const toggleFoodItem = useBrainStore((s) => s.toggleFoodItem)

  const totalCalories = foodItems.reduce((sum, f) => sum + f.calories, 0)

  return (
    <MacWidgetCard size="medium" title="Today's Meals">
      <ul className="space-y-1.5">
        {meals.map((meal) => {
          const items = foodItems.filter((f) => f.mealId === meal.id)
          const calories = items.reduce((sum, f) => sum + f.calories, 0)
          return (
            <li key={meal.id}>
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-medium text-ink-primary">{meal.name}</span>
                <span className="tabular text-ink-muted">{calories} kcal</span>
              </div>
              <div className="ml-1 mt-0.5 space-y-0.5">
                {items.map((f) => (
                  <label key={f.id} className="flex cursor-pointer items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={f.done}
                      onChange={() => toggleFoodItem(f.id)}
                      className="h-3 w-3 shrink-0 accent-[var(--brand-accent)]"
                    />
                    <span
                      className={`truncate text-[11px] leading-tight ${
                        f.done ? 'text-ink-muted line-through' : 'text-ink-secondary'
                      }`}
                    >
                      {f.name}
                    </span>
                  </label>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t border-line-hairline pt-1.5 text-[11px] font-semibold text-ink-primary">
        <span>Total</span>
        <span className="tabular">{totalCalories} kcal</span>
      </div>
    </MacWidgetCard>
  )
}

const POLL_MS = 5000

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function SpotifyWidgetPreview() {
  const clientId = useBrainStore((s) => s.spotifyClientId)
  const setSpotifyClientId = useBrainStore((s) => s.setSpotifyClientId)

  const [clientIdInput, setClientIdInput] = useState(clientId)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<SpotifyPlaybackState | null>(null)

  const available = typeof window !== 'undefined' && !!window.electronAPI

  useEffect(() => {
    if (!available) return
    window.electronAPI!.spotifyIsConnected().then(setConnected)
  }, [available])

  useEffect(() => {
    if (!connected) return
    let cancelled = false
    async function poll() {
      try {
        const s = await getPlaybackState()
        if (!cancelled) setState(s)
      } catch {
        // transient network/API hiccup — keep last known state, try again next tick
      }
    }
    poll()
    const interval = setInterval(poll, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [connected])

  async function handleConnect() {
    if (!clientIdInput.trim()) return
    setConnecting(true)
    setError(null)
    setSpotifyClientId(clientIdInput.trim())
    try {
      await window.electronAPI!.spotifyConnect(clientIdInput.trim())
      setConnected(true)
    } catch {
      setError('Connection failed or timed out — try again.')
    } finally {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    await window.electronAPI!.spotifyDisconnect()
    setConnected(false)
    setState(null)
  }

  async function handleToggle() {
    if (!state) return
    setState({ ...state, isPlaying: !state.isPlaying })
    try {
      if (state.isPlaying) await spotifyPause()
      else await spotifyPlay()
    } catch {
      setError('Nothing to play — open Spotify on a device first.')
    }
  }

  async function handleNext() {
    try {
      await skipNext()
      setTimeout(() => getPlaybackState().then(setState).catch(() => {}), 400)
    } catch {
      // ignore — next poll will reconcile
    }
  }

  async function handlePrevious() {
    try {
      await skipPrevious()
      setTimeout(() => getPlaybackState().then(setState).catch(() => {}), 400)
    } catch {
      // ignore — next poll will reconcile
    }
  }

  if (!available) {
    return (
      <MacWidgetCard size="medium" title="Spotify">
        <p className="text-xs text-ink-muted">Available in the desktop app only.</p>
      </MacWidgetCard>
    )
  }

  if (!connected) {
    return (
      <MacWidgetCard size="medium" title="Spotify">
        <div className="space-y-2">
          <input
            value={clientIdInput}
            onChange={(e) => setClientIdInput(e.target.value)}
            placeholder="Spotify Client ID"
            className="w-full rounded-lg border border-line-border bg-surface-1 px-2 py-1.5 text-xs text-ink-primary outline-none focus:border-accent"
          />
          <Button
            className="w-full justify-center text-xs"
            onClick={handleConnect}
          >
            {connecting ? 'Waiting for Spotify…' : 'Connect Spotify'}
          </Button>
          {error && <p className="text-[11px] text-status-critical">{error}</p>}
          <p className="text-[10px] leading-snug text-ink-muted">
            Needs a free Spotify Developer app — see{' '}
            <code className="rounded bg-surface-plane px-1 py-0.5">macos-widget/README.md</code>.
          </p>
        </div>
      </MacWidgetCard>
    )
  }

  return (
    <MacWidgetCard size="medium" title="Spotify">
      <div className="flex items-center gap-3">
        {state?.albumArt ? (
          <img src={state.albumArt} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-surface-plane text-ink-muted">
            <Music size={18} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {state ? (
            <>
              <p className="truncate text-[12px] font-medium text-ink-primary">{state.trackName}</p>
              <p className="truncate text-[11px] text-ink-muted">{state.artistName}</p>
              <p className="tabular mt-0.5 text-[10px] text-ink-muted">
                {formatMs(state.progressMs)} / {formatMs(state.durationMs)}
              </p>
            </>
          ) : (
            <p className="text-[11px] text-ink-muted">Nothing playing</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handlePrevious}
          className="text-ink-secondary hover:text-ink-primary"
          aria-label="Previous"
        >
          <SkipBack size={16} />
        </button>
        <button
          type="button"
          onClick={handleToggle}
          disabled={!state}
          className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-40"
          style={{ backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' }}
          aria-label={state?.isPlaying ? 'Pause' : 'Play'}
        >
          {state?.isPlaying ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="text-ink-secondary hover:text-ink-primary"
          aria-label="Next"
        >
          <SkipForward size={16} />
        </button>
      </div>
      <button
        type="button"
        onClick={handleDisconnect}
        className="mt-2 w-full text-center text-[10px] text-ink-muted hover:text-ink-secondary"
      >
        Disconnect
      </button>
    </MacWidgetCard>
  )
}

export function Widgets() {
  return (
    <div>
      <PageHeader
        title="Widgets"
        description="Live previews of your macOS Notification Center widgets — check things off right here, and it stays in sync with the rest of the app."
      />
      <div className="flex flex-wrap items-start gap-4">
        <TasksWidgetPreview />
        <WorkoutWidgetPreview />
        <MealsWidgetPreview />
        <SpotifyWidgetPreview />
      </div>
      <p className="mt-6 max-w-xl text-xs text-ink-muted">
        The first three mirror the native macOS widgets you can add to Notification Center — see{' '}
        <code className="rounded bg-surface-plane px-1 py-0.5">macos-widget/README.md</code> in the project for
        Xcode setup instructions.
      </p>
    </div>
  )
}
