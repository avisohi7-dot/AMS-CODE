export type ID = string

export type LifeArea =
  | 'Health'
  | 'Career'
  | 'Finance'
  | 'Relationships'
  | 'Learning'
  | 'Personal'

export type ProjectStatus = 'active' | 'on-hold' | 'done'

export interface Project {
  id: ID
  title: string
  description: string
  area: LifeArea
  status: ProjectStatus
  dueDate: string | null
  createdAt: string
  archived: boolean
}

export interface Area {
  id: ID
  name: LifeArea
  description: string
  standard: string
}

export interface Resource {
  id: ID
  title: string
  url: string
  notes: string
  tags: string[]
  createdAt: string
  archived: boolean
}

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: ID
  title: string
  status: TaskStatus
  priority: TaskPriority
  projectId: ID | null
  dueDate: string | null
  createdAt: string
}

export interface Note {
  id: ID
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Habit {
  id: ID
  name: string
  color: string
  createdAt: string
  archived: boolean
}

export interface HabitLog {
  id: ID
  habitId: ID
  date: string // yyyy-mm-dd
}

export interface JournalEntry {
  id: ID
  date: string // yyyy-mm-dd
  mood: 1 | 2 | 3 | 4 | 5
  content: string
  createdAt: string
}

export type GoalStatus = 'not-started' | 'in-progress' | 'achieved'

export interface Goal {
  id: ID
  title: string
  area: LifeArea
  status: GoalStatus
  progress: number // 0-100
  targetDate: string | null
  createdAt: string
}
