import { useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { useBrainStore } from '../store'
import type { Meal, WorkoutDay } from '../types'
import { Button, Card, EmptyState, IconButton, PageHeader, ProgressBar } from '../components/ui'
import { FormRow, Modal, inputClass } from '../components/Modal'

const TABS = [
  { key: 'gym', label: 'Gym Plan' },
  { key: 'diet', label: 'Diet Plan' },
] as const
type FitnessTab = (typeof TABS)[number]['key']

export function Fitness() {
  const [tab, setTab] = useState<FitnessTab>('gym')
  return (
    <div>
      <PageHeader title="Fitness" description="Your workout split and daily nutrition plan." />
      <div className="mb-5 inline-flex rounded-lg border border-line-border p-0.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              tab === key ? '' : 'text-ink-secondary hover:text-ink-primary'
            }`}
            style={tab === key ? { backgroundColor: 'var(--brand-accent)', color: 'var(--brand-accent-ink)' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'gym' ? <GymPlanTab /> : <DietPlanTab />}
    </div>
  )
}

function GymPlanTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const workoutDays = useBrainStore((s) => s.workoutDays)
  const selected = workoutDays.find((w) => w.id === selectedId) ?? null

  return selected ? (
    <ExercisesView day={selected} onBack={() => setSelectedId(null)} />
  ) : (
    <WorkoutDaysGrid onSelect={setSelectedId} />
  )
}

function WorkoutDaysGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const workoutDays = useBrainStore((s) => s.workoutDays)
  const exercises = useBrainStore((s) => s.exercises)
  const addWorkoutDay = useBrainStore((s) => s.addWorkoutDay)
  const updateWorkoutDay = useBrainStore((s) => s.updateWorkoutDay)
  const deleteWorkoutDay = useBrainStore((s) => s.deleteWorkoutDay)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; dayOfWeek: string }>({ name: '', dayOfWeek: '' })

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', dayOfWeek: '' })
    setOpen(true)
  }

  function openEdit(day: WorkoutDay) {
    setEditingId(day.id)
    setForm({ name: day.name, dayOfWeek: day.dayOfWeek })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) updateWorkoutDay(editingId, { name: form.name.trim(), dayOfWeek: form.dayOfWeek.trim() })
    else addWorkoutDay({ name: form.name.trim(), dayOfWeek: form.dayOfWeek.trim() })
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> New workout day
        </Button>
      </div>

      {workoutDays.length === 0 ? (
        <EmptyState title="No workout days yet" description="Build your split — Push, Pull, Legs, Rest…" />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workoutDays.map((day) => {
            const dayExercises = exercises.filter((e) => e.workoutDayId === day.id)
            const done = dayExercises.filter((e) => e.done).length
            return (
              <Card key={day.id} className="overflow-hidden">
                <button onClick={() => onSelect(day.id)} className="block w-full text-left">
                  <div
                    className="flex h-20 items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: 'linear-gradient(155deg, var(--brand-accent), color-mix(in srgb, var(--brand-accent) 40%, black))',
                    }}
                  >
                    {day.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-ink-primary">{day.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-ink-secondary">{day.dayOfWeek || 'Unscheduled'}</span>
                      <span className="tabular text-xs text-ink-muted">
                        {done}/{dayExercises.length}
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex justify-end gap-1.5 border-t border-line-hairline p-2">
                  <IconButton label="Edit" onClick={() => openEdit(day)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteWorkoutDay(day.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit workout day' : 'New workout day'}>
        <form onSubmit={submit}>
          <FormRow label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Push Day"
            />
          </FormRow>
          <FormRow label="Day of week">
            <input
              className={inputClass}
              value={form.dayOfWeek}
              onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}
              placeholder="e.g. Monday"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create workout day'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function ExercisesView({ day, onBack }: { day: WorkoutDay; onBack: () => void }) {
  const exercises = useBrainStore((s) => s.exercises.filter((e) => e.workoutDayId === day.id))
  const addExercise = useBrainStore((s) => s.addExercise)
  const toggleExercise = useBrainStore((s) => s.toggleExercise)
  const deleteExercise = useBrainStore((s) => s.deleteExercise)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', sets: 3, reps: 10, weight: '' })

  const done = exercises.filter((e) => e.done).length
  const progress = exercises.length ? Math.round((done / exercises.length) * 100) : 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    addExercise({
      workoutDayId: day.id,
      name: form.name.trim(),
      sets: form.sets,
      reps: form.reps,
      weight: form.weight.trim(),
    })
    setForm({ name: '', sets: 3, reps: 10, weight: '' })
    setOpen(false)
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft size={15} /> Back to workout days
      </button>
      <PageHeader
        title={day.name}
        description={`${day.dayOfWeek || 'Unscheduled'} — ${done}/${exercises.length} exercises done.`}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add exercise
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <ProgressBar value={progress} accent="var(--status-good)" />
      </Card>

      {exercises.length === 0 ? (
        <EmptyState title="No exercises yet" description="Add the exercises for this workout day." />
      ) : (
        <Card className="divide-y divide-line-hairline">
          {exercises.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between gap-3 p-3.5">
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={ex.done}
                  onChange={() => toggleExercise(ex.id)}
                  className="h-4 w-4 accent-[var(--brand-accent)]"
                />
                <div className="min-w-0">
                  <span className={`block truncate text-sm ${ex.done ? 'text-ink-muted line-through' : 'text-ink-primary'}`}>
                    {ex.name}
                  </span>
                  <span className="tabular text-xs text-ink-muted">
                    {ex.sets} × {ex.reps}
                    {ex.weight ? ` · ${ex.weight}` : ''}
                  </span>
                </div>
              </label>
              <IconButton label="Delete" danger onClick={() => deleteExercise(ex.id)}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add exercise">
        <form onSubmit={submit}>
          <FormRow label="Exercise name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Bench press"
            />
          </FormRow>
          <div className="grid grid-cols-3 gap-3">
            <FormRow label="Sets">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.sets}
                onChange={(e) => setForm({ ...form, sets: Number(e.target.value) })}
              />
            </FormRow>
            <FormRow label="Reps">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.reps}
                onChange={(e) => setForm({ ...form, reps: Number(e.target.value) })}
              />
            </FormRow>
            <FormRow label="Weight">
              <input
                className={inputClass}
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 60kg"
              />
            </FormRow>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add exercise</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function DietPlanTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const meals = useBrainStore((s) => s.meals)
  const selected = meals.find((m) => m.id === selectedId) ?? null

  return selected ? (
    <FoodItemsView meal={selected} onBack={() => setSelectedId(null)} />
  ) : (
    <MealsGrid onSelect={setSelectedId} />
  )
}

function MealsGrid({ onSelect }: { onSelect: (id: string) => void }) {
  const meals = useBrainStore((s) => s.meals)
  const foodItems = useBrainStore((s) => s.foodItems)
  const addMeal = useBrainStore((s) => s.addMeal)
  const updateMeal = useBrainStore((s) => s.updateMeal)
  const deleteMeal = useBrainStore((s) => s.deleteMeal)

  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{ name: string; time: string }>({ name: '', time: '' })

  function openCreate() {
    setEditingId(null)
    setForm({ name: '', time: '' })
    setOpen(true)
  }

  function openEdit(meal: Meal) {
    setEditingId(meal.id)
    setForm({ name: meal.name, time: meal.time })
    setOpen(true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingId) updateMeal(editingId, { name: form.name.trim(), time: form.time.trim() })
    else addMeal({ name: form.name.trim(), time: form.time.trim() })
    setOpen(false)
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus size={16} /> New meal
        </Button>
      </div>

      {meals.length === 0 ? (
        <EmptyState title="No meals yet" description="Add Breakfast, Lunch, Dinner and Snacks to plan your day." />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {meals.map((meal) => {
            const items = foodItems.filter((f) => f.mealId === meal.id)
            const calories = items.reduce((sum, f) => sum + f.calories, 0)
            const done = items.filter((f) => f.done).length
            return (
              <Card key={meal.id} className="overflow-hidden">
                <button onClick={() => onSelect(meal.id)} className="block w-full text-left">
                  <div
                    className="flex h-20 items-center justify-center text-2xl font-bold text-white"
                    style={{
                      background: 'linear-gradient(155deg, var(--brand-accent), color-mix(in srgb, var(--brand-accent) 40%, black))',
                    }}
                  >
                    {meal.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-semibold text-ink-primary">{meal.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-ink-secondary">{meal.time || 'Anytime'}</span>
                      <span className="tabular text-xs text-ink-muted">
                        {done}/{items.length} · {calories} kcal
                      </span>
                    </div>
                  </div>
                </button>
                <div className="flex justify-end gap-1.5 border-t border-line-hairline p-2">
                  <IconButton label="Edit" onClick={() => openEdit(meal)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton label="Delete" danger onClick={() => deleteMeal(meal.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? 'Edit meal' : 'New meal'}>
        <form onSubmit={submit}>
          <FormRow label="Name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Breakfast"
            />
          </FormRow>
          <FormRow label="Time">
            <input
              className={inputClass}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              placeholder="e.g. 07:30"
            />
          </FormRow>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Save changes' : 'Create meal'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function FoodItemsView({ meal, onBack }: { meal: Meal; onBack: () => void }) {
  const foodItems = useBrainStore((s) => s.foodItems.filter((f) => f.mealId === meal.id))
  const addFoodItem = useBrainStore((s) => s.addFoodItem)
  const toggleFoodItem = useBrainStore((s) => s.toggleFoodItem)
  const deleteFoodItem = useBrainStore((s) => s.deleteFoodItem)

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', calories: 0, protein: 0 })

  const done = foodItems.filter((f) => f.done).length
  const progress = foodItems.length ? Math.round((done / foodItems.length) * 100) : 0
  const totalCalories = foodItems.reduce((sum, f) => sum + f.calories, 0)
  const totalProtein = foodItems.reduce((sum, f) => sum + f.protein, 0)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    addFoodItem({
      mealId: meal.id,
      name: form.name.trim(),
      calories: form.calories,
      protein: form.protein,
    })
    setForm({ name: '', calories: 0, protein: 0 })
    setOpen(false)
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-secondary hover:text-ink-primary"
      >
        <ArrowLeft size={15} /> Back to meals
      </button>
      <PageHeader
        title={meal.name}
        description={`${meal.time || 'Anytime'} — ${totalCalories} kcal · ${totalProtein}g protein.`}
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus size={16} /> Add food
          </Button>
        }
      />

      <Card className="mb-4 p-4">
        <ProgressBar value={progress} accent="var(--status-good)" />
      </Card>

      {foodItems.length === 0 ? (
        <EmptyState title="No food items yet" description="Add what you're eating for this meal." />
      ) : (
        <Card className="divide-y divide-line-hairline">
          {foodItems.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3 p-3.5">
              <label className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={f.done}
                  onChange={() => toggleFoodItem(f.id)}
                  className="h-4 w-4 accent-[var(--brand-accent)]"
                />
                <div className="min-w-0">
                  <span className={`block truncate text-sm ${f.done ? 'text-ink-muted line-through' : 'text-ink-primary'}`}>
                    {f.name}
                  </span>
                  <span className="tabular text-xs text-ink-muted">
                    {f.calories} kcal · {f.protein}g protein
                  </span>
                </div>
              </label>
              <IconButton label="Delete" danger onClick={() => deleteFoodItem(f.id)}>
                <Trash2 size={14} />
              </IconButton>
            </div>
          ))}
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add food item">
        <form onSubmit={submit}>
          <FormRow label="Food name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
              required
              placeholder="e.g. Grilled chicken breast"
            />
          </FormRow>
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Calories">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.calories}
                onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
              />
            </FormRow>
            <FormRow label="Protein (g)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.protein}
                onChange={(e) => setForm({ ...form, protein: Number(e.target.value) })}
              />
            </FormRow>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add food</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
