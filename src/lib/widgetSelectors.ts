import type { Task, WorkoutDay } from '../types'
import { todayISO } from './id'

const PRIORITY_RANK: Record<Task['priority'], number> = { high: 0, medium: 1, low: 2 }

export function todaysWeekdayName(): string {
  return new Date().toLocaleDateString('en-GB', { weekday: 'long' })
}

export function selectTasksToday(tasks: Task[]): Task[] {
  const today = todayISO()
  return tasks
    .filter((t) => t.status !== 'done' && (t.dueDate === today || (t.dueDate !== null && t.dueDate < today)))
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority])
    .slice(0, 8)
}

export function selectWorkoutToday(workoutDays: WorkoutDay[]): WorkoutDay | null {
  const weekday = todaysWeekdayName()
  return workoutDays.find((w) => w.dayOfWeek.trim().toLowerCase() === weekday.toLowerCase()) ?? null
}
