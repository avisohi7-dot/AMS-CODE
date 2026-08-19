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

export interface InboxItem {
  id: ID
  content: string
  createdAt: string
}

export interface WeeklyFocus {
  id: ID
  weekStart: string // yyyy-mm-dd, Monday
  priorities: string[] // up to 3
  notes: string
}

export interface MonthlyReview {
  id: ID
  month: string // yyyy-mm
  wins: string
  challenges: string
  focusNext: string
  createdAt: string
}

export type MediaType = 'book' | 'article' | 'video' | 'podcast'
export type MediaStatus = 'want' | 'in-progress' | 'done'

export interface MediaItem {
  id: ID
  title: string
  type: MediaType
  status: MediaStatus
  rating: number // 0-5, 0 = unrated
  url: string
  notes: string
  createdAt: string
  finishedAt: string | null
}

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: ID
  date: string // yyyy-mm-dd
  description: string
  category: string
  type: TransactionType
  amount: number
  createdAt: string
}

export interface FinanceSettings {
  monthlyBudget: number
  currency: string
}

export interface Tool {
  id: ID
  name: string
  url: string
  category: string
  createdAt: string
}

export type ContactTag = 'Work' | 'Friends' | 'Family' | 'Relatives' | 'Services'

export interface Contact {
  id: ID
  name: string
  phone: string
  email: string
  tag: ContactTag
  createdAt: string
}

export interface LearningSphere {
  id: ID
  name: string
  area: LifeArea
  createdAt: string
}

export interface SphereTopic {
  id: ID
  title: string
  sphereId: ID
  done: boolean
  createdAt: string
}

export type PaperType = 'Essay' | 'Web article' | 'Guide' | 'Research paper'

export interface Paper {
  id: ID
  title: string
  url: string
  type: PaperType
  area: LifeArea
  createdAt: string
}

export interface WorkoutDay {
  id: ID
  name: string // e.g. "Push Day", "Leg Day", "Rest Day"
  dayOfWeek: string // e.g. "Monday" (free text)
  createdAt: string
}

export interface Exercise {
  id: ID
  workoutDayId: ID
  name: string
  sets: number
  reps: number
  weight: string // free text, e.g. "60kg" or "bodyweight"
  done: boolean
  createdAt: string
}

export interface Meal {
  id: ID
  name: string // e.g. "Breakfast"
  time: string // free text, e.g. "08:00"
  createdAt: string
}

export interface FoodItem {
  id: ID
  mealId: ID
  name: string
  calories: number
  protein: number // grams
  done: boolean
  createdAt: string
}

export interface Course {
  id: ID
  title: string // e.g. "Physics"
  semester: string // free text, e.g. "8th semester"
  teacher: string
  studentId: string
  createdAt: string
  archived: boolean
}

export interface CourseTask {
  id: ID
  courseId: ID
  title: string
  done: boolean
  createdAt: string
}

export type AssignmentType = 'Assignment' | 'Project' | 'Research' | 'Homework'

export interface Assignment {
  id: ID
  courseId: ID
  title: string
  type: AssignmentType
  status: TaskStatus
  dueDate: string | null
  createdAt: string
}

export type ClockStyle =
  | 'analog'
  | 'analog-roman'
  | 'analog-numbers'
  | 'analog-modern'
  | 'digital'
  | 'minimal'
