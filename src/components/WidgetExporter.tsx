import { useEffect, useRef } from 'react'
import { useBrainStore } from '../store'
import { buildWidgetData } from '../lib/widgetExport'

// Keeps ~/Library/Application Support/SecondBrainOS/widget-data.json in sync
// for the macOS WidgetKit companion app to read. No-op outside Electron.
export function WidgetExporter() {
  const tasks = useBrainStore((s) => s.tasks)
  const workoutDays = useBrainStore((s) => s.workoutDays)
  const exercises = useBrainStore((s) => s.exercises)
  const meals = useBrainStore((s) => s.meals)
  const foodItems = useBrainStore((s) => s.foodItems)

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!window.electronAPI) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const data = buildWidgetData(tasks, workoutDays, exercises, meals, foodItems)
      window.electronAPI!.writeWidgetData(data).catch(() => {})
    }, 800)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [tasks, workoutDays, exercises, meals, foodItems])

  return null
}
