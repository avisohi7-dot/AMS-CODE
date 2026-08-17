import type { Exercise, FoodItem, Meal, Task, WorkoutDay } from '../types'
import { selectTasksToday, selectWorkoutToday } from './widgetSelectors'

export interface WidgetTask {
  title: string
  priority: Task['priority']
  status: Task['status']
  dueDate: string | null
}

export interface WidgetExercise {
  name: string
  sets: number
  reps: number
  weight: string
  done: boolean
}

export interface WidgetWorkout {
  name: string
  dayOfWeek: string
  exercises: WidgetExercise[]
}

export interface WidgetFoodItem {
  name: string
  calories: number
  done: boolean
}

export interface WidgetMeal {
  name: string
  time: string
  items: WidgetFoodItem[]
}

export interface WidgetData {
  generatedAt: string
  tasksToday: WidgetTask[]
  workoutToday: WidgetWorkout | null
  mealsToday: WidgetMeal[]
}

export function buildWidgetData(
  tasks: Task[],
  workoutDays: WorkoutDay[],
  exercises: Exercise[],
  meals: Meal[],
  foodItems: FoodItem[]
): WidgetData {
  const tasksToday: WidgetTask[] = selectTasksToday(tasks).map((t) => ({
    title: t.title,
    priority: t.priority,
    status: t.status,
    dueDate: t.dueDate,
  }))

  const matchedDay = selectWorkoutToday(workoutDays)
  const workoutToday: WidgetWorkout | null = matchedDay
    ? {
        name: matchedDay.name,
        dayOfWeek: matchedDay.dayOfWeek,
        exercises: exercises
          .filter((e) => e.workoutDayId === matchedDay.id)
          .map((e) => ({ name: e.name, sets: e.sets, reps: e.reps, weight: e.weight, done: e.done })),
      }
    : null

  const mealsToday: WidgetMeal[] = meals.map((m) => ({
    name: m.name,
    time: m.time,
    items: foodItems
      .filter((f) => f.mealId === m.id)
      .map((f) => ({ name: f.name, calories: f.calories, done: f.done })),
  }))

  return {
    generatedAt: new Date().toISOString(),
    tasksToday,
    workoutToday,
    mealsToday,
  }
}
