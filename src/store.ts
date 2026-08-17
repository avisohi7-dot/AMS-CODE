import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Area,
  Goal,
  Habit,
  HabitLog,
  JournalEntry,
  Note,
  Project,
  Resource,
  Task,
} from './types'
import { makeId } from './lib/id'
import {
  seedAreas,
  seedGoals,
  seedHabitLogs,
  seedHabits,
  seedJournal,
  seedNotes,
  seedProjects,
  seedResources,
  seedTasks,
} from './lib/seed'

interface BrainState {
  areas: Area[]
  projects: Project[]
  resources: Resource[]
  tasks: Task[]
  notes: Note[]
  habits: Habit[]
  habitLogs: HabitLog[]
  journal: JournalEntry[]
  goals: Goal[]
  theme: 'light' | 'dark' | 'system'

  setTheme: (t: 'light' | 'dark' | 'system') => void

  addProject: (p: Omit<Project, 'id' | 'createdAt' | 'archived'>) => void
  updateProject: (id: string, patch: Partial<Project>) => void
  deleteProject: (id: string) => void
  archiveProject: (id: string, archived: boolean) => void

  addResource: (r: Omit<Resource, 'id' | 'createdAt' | 'archived'>) => void
  updateResource: (id: string, patch: Partial<Resource>) => void
  deleteResource: (id: string) => void
  archiveResource: (id: string, archived: boolean) => void

  updateArea: (id: string, patch: Partial<Area>) => void

  addTask: (t: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  cycleTaskStatus: (id: string) => void

  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, patch: Partial<Note>) => void
  deleteNote: (id: string) => void

  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  toggleHabitLog: (habitId: string, date: string) => void
  archiveHabit: (id: string, archived: boolean) => void

  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'createdAt'>) => void
  updateJournalEntry: (id: string, patch: Partial<JournalEntry>) => void
  deleteJournalEntry: (id: string) => void

  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  resetDemoData: () => void
}

function freshSeed() {
  const areas = seedAreas()
  const projects = seedProjects()
  const resources = seedResources()
  const tasks = seedTasks(projects)
  const notes = seedNotes()
  const habits = seedHabits()
  const habitLogs = seedHabitLogs(habits)
  const journal = seedJournal()
  const goals = seedGoals()
  return { areas, projects, resources, tasks, notes, habits, habitLogs, journal, goals }
}

const TASK_STATUS_CYCLE: Task['status'][] = ['todo', 'in-progress', 'done']

export const useBrainStore = create<BrainState>()(
  persist(
    (set) => ({
      ...freshSeed(),
      theme: 'system',

      setTheme: (t) => set({ theme: t }),

      addProject: (p) =>
        set((s) => ({
          projects: [
            { ...p, id: makeId(), createdAt: new Date().toISOString(), archived: false },
            ...s.projects,
          ],
        })),
      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProject: (id) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          tasks: s.tasks.map((t) => (t.projectId === id ? { ...t, projectId: null } : t)),
        })),
      archiveProject: (id, archived) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, archived } : p)) })),

      addResource: (r) =>
        set((s) => ({
          resources: [
            { ...r, id: makeId(), createdAt: new Date().toISOString(), archived: false },
            ...s.resources,
          ],
        })),
      updateResource: (id, patch) =>
        set((s) => ({ resources: s.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
      deleteResource: (id) => set((s) => ({ resources: s.resources.filter((r) => r.id !== id) })),
      archiveResource: (id, archived) =>
        set((s) => ({ resources: s.resources.map((r) => (r.id === id ? { ...r, archived } : r)) })),

      updateArea: (id, patch) =>
        set((s) => ({ areas: s.areas.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),

      addTask: (t) =>
        set((s) => ({
          tasks: [{ ...t, id: makeId(), createdAt: new Date().toISOString() }, ...s.tasks],
        })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
      cycleTaskStatus: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t
            const next = TASK_STATUS_CYCLE[(TASK_STATUS_CYCLE.indexOf(t.status) + 1) % 3]
            return { ...t, status: next }
          }),
        })),

      addNote: (n) =>
        set((s) => ({
          notes: [
            {
              ...n,
              id: makeId(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            ...s.notes,
          ],
        })),
      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n
          ),
        })),
      deleteNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addHabit: (h) =>
        set((s) => ({
          habits: [
            { ...h, id: makeId(), createdAt: new Date().toISOString(), archived: false },
            ...s.habits,
          ],
        })),
      toggleHabitLog: (habitId, date) =>
        set((s) => {
          const existing = s.habitLogs.find((l) => l.habitId === habitId && l.date === date)
          if (existing) {
            return { habitLogs: s.habitLogs.filter((l) => l.id !== existing.id) }
          }
          return { habitLogs: [...s.habitLogs, { id: makeId(), habitId, date }] }
        }),
      archiveHabit: (id, archived) =>
        set((s) => ({ habits: s.habits.map((h) => (h.id === id ? { ...h, archived } : h)) })),

      addJournalEntry: (e) =>
        set((s) => ({
          journal: [{ ...e, id: makeId(), createdAt: new Date().toISOString() }, ...s.journal],
        })),
      updateJournalEntry: (id, patch) =>
        set((s) => ({ journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch } : j)) })),
      deleteJournalEntry: (id) => set((s) => ({ journal: s.journal.filter((j) => j.id !== id) })),

      addGoal: (g) =>
        set((s) => ({
          goals: [{ ...g, id: makeId(), createdAt: new Date().toISOString() }, ...s.goals],
        })),
      updateGoal: (id, patch) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      resetDemoData: () => set({ ...freshSeed() }),
    }),
    { name: 'second-brain-os-storage' }
  )
)
