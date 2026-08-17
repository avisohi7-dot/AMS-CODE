import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Area,
  FinanceSettings,
  Goal,
  Habit,
  HabitLog,
  InboxItem,
  JournalEntry,
  MediaItem,
  MonthlyReview,
  Note,
  Project,
  Resource,
  Task,
  Transaction,
  WeeklyFocus,
} from './types'
import { makeId } from './lib/id'
import {
  seedAreas,
  seedFinanceSettings,
  seedGoals,
  seedHabitLogs,
  seedHabits,
  seedInbox,
  seedJournal,
  seedMedia,
  seedMonthlyReviews,
  seedNotes,
  seedProjects,
  seedResources,
  seedTasks,
  seedTransactions,
  seedWeeklyFocus,
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
  inbox: InboxItem[]
  weeklyFocus: WeeklyFocus[]
  monthlyReviews: MonthlyReview[]
  media: MediaItem[]
  transactions: Transaction[]
  financeSettings: FinanceSettings
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

  addInboxItem: (content: string) => void
  deleteInboxItem: (id: string) => void
  convertInboxItemToTask: (id: string) => void
  convertInboxItemToNote: (id: string) => void
  convertInboxItemToResource: (id: string) => void

  upsertWeeklyFocus: (weekStart: string, patch: Partial<Omit<WeeklyFocus, 'id' | 'weekStart'>>) => void

  addMonthlyReview: (r: Omit<MonthlyReview, 'id' | 'createdAt'>) => void
  updateMonthlyReview: (id: string, patch: Partial<MonthlyReview>) => void
  deleteMonthlyReview: (id: string) => void

  addMedia: (m: Omit<MediaItem, 'id' | 'createdAt'>) => void
  updateMedia: (id: string, patch: Partial<MediaItem>) => void
  deleteMedia: (id: string) => void

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  updateFinanceSettings: (patch: Partial<FinanceSettings>) => void

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
  const inbox = seedInbox()
  const weeklyFocus = seedWeeklyFocus()
  const monthlyReviews = seedMonthlyReviews()
  const media = seedMedia()
  const transactions = seedTransactions()
  const financeSettings = seedFinanceSettings()
  return {
    areas,
    projects,
    resources,
    tasks,
    notes,
    habits,
    habitLogs,
    journal,
    goals,
    inbox,
    weeklyFocus,
    monthlyReviews,
    media,
    transactions,
    financeSettings,
  }
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

      addInboxItem: (content) =>
        set((s) => ({
          inbox: [{ id: makeId(), content, createdAt: new Date().toISOString() }, ...s.inbox],
        })),
      deleteInboxItem: (id) => set((s) => ({ inbox: s.inbox.filter((i) => i.id !== id) })),
      convertInboxItemToTask: (id) =>
        set((s) => {
          const item = s.inbox.find((i) => i.id === id)
          if (!item) return s
          return {
            inbox: s.inbox.filter((i) => i.id !== id),
            tasks: [
              {
                id: makeId(),
                title: item.content,
                status: 'todo',
                priority: 'medium',
                projectId: null,
                dueDate: null,
                createdAt: new Date().toISOString(),
              },
              ...s.tasks,
            ],
          }
        }),
      convertInboxItemToNote: (id) =>
        set((s) => {
          const item = s.inbox.find((i) => i.id === id)
          if (!item) return s
          return {
            inbox: s.inbox.filter((i) => i.id !== id),
            notes: [
              {
                id: makeId(),
                title: item.content.slice(0, 60),
                content: item.content,
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              ...s.notes,
            ],
          }
        }),
      convertInboxItemToResource: (id) =>
        set((s) => {
          const item = s.inbox.find((i) => i.id === id)
          if (!item) return s
          return {
            inbox: s.inbox.filter((i) => i.id !== id),
            resources: [
              {
                id: makeId(),
                title: item.content.slice(0, 60),
                url: '',
                notes: item.content,
                tags: [],
                createdAt: new Date().toISOString(),
                archived: false,
              },
              ...s.resources,
            ],
          }
        }),

      upsertWeeklyFocus: (weekStart, patch) =>
        set((s) => {
          const existing = s.weeklyFocus.find((w) => w.weekStart === weekStart)
          if (existing) {
            return {
              weeklyFocus: s.weeklyFocus.map((w) =>
                w.weekStart === weekStart ? { ...w, ...patch } : w
              ),
            }
          }
          return {
            weeklyFocus: [
              { id: makeId(), weekStart, priorities: ['', '', ''], notes: '', ...patch },
              ...s.weeklyFocus,
            ],
          }
        }),

      addMonthlyReview: (r) =>
        set((s) => ({
          monthlyReviews: [
            { ...r, id: makeId(), createdAt: new Date().toISOString() },
            ...s.monthlyReviews,
          ],
        })),
      updateMonthlyReview: (id, patch) =>
        set((s) => ({
          monthlyReviews: s.monthlyReviews.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteMonthlyReview: (id) =>
        set((s) => ({ monthlyReviews: s.monthlyReviews.filter((r) => r.id !== id) })),

      addMedia: (m) =>
        set((s) => ({
          media: [{ ...m, id: makeId(), createdAt: new Date().toISOString() }, ...s.media],
        })),
      updateMedia: (id, patch) =>
        set((s) => ({ media: s.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      deleteMedia: (id) => set((s) => ({ media: s.media.filter((m) => m.id !== id) })),

      addTransaction: (t) =>
        set((s) => ({
          transactions: [
            { ...t, id: makeId(), createdAt: new Date().toISOString() },
            ...s.transactions,
          ],
        })),
      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      updateFinanceSettings: (patch) =>
        set((s) => ({ financeSettings: { ...s.financeSettings, ...patch } })),

      resetDemoData: () => set({ ...freshSeed() }),
    }),
    { name: 'second-brain-os-storage' }
  )
)
