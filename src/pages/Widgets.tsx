import type { ReactNode } from 'react'
import { useBrainStore } from '../store'
import { PageHeader } from '../components/ui'
import { selectTasksToday, selectWorkoutToday } from '../lib/widgetSelectors'

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
      </div>
      <p className="mt-6 max-w-xl text-xs text-ink-muted">
        These mirror the native macOS widgets you can add to Notification Center — see{' '}
        <code className="rounded bg-surface-plane px-1 py-0.5">macos-widget/README.md</code> in the project for
        Xcode setup instructions.
      </p>
    </div>
  )
}
