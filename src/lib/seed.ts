import type {
  Area,
  Contact,
  Exercise,
  FinanceSettings,
  FoodItem,
  Goal,
  Habit,
  HabitLog,
  InboxItem,
  JournalEntry,
  LearningSphere,
  LifeArea,
  Meal,
  MediaItem,
  MonthlyReview,
  Note,
  Paper,
  Project,
  Resource,
  SphereTopic,
  Task,
  Tool,
  Transaction,
  WeeklyFocus,
  WorkoutDay,
} from '../types'
import { makeId, todayISO } from './id'
import { currentMonthISO, currentWeekStartISO } from './date'

const LIFE_AREAS: LifeArea[] = [
  'Health',
  'Career',
  'Finance',
  'Relationships',
  'Learning',
  'Personal',
]

function daysAgoISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

function daysFromNowISO(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function seedAreas(): Area[] {
  return [
    { id: makeId(), name: 'Health', description: 'Body, fitness, sleep, nutrition.', standard: 'Move daily, sleep 7.5h+' },
    { id: makeId(), name: 'Career', description: 'Work, craft, professional growth.', standard: 'Ship something meaningful every week' },
    { id: makeId(), name: 'Finance', description: 'Budget, savings, investing.', standard: 'Track spending, save 20%' },
    { id: makeId(), name: 'Relationships', description: 'Family, friends, community.', standard: 'Reach out weekly' },
    { id: makeId(), name: 'Learning', description: 'Reading, courses, skills.', standard: '30 min of deliberate learning daily' },
    { id: makeId(), name: 'Personal', description: 'Hobbies, reflection, admin.', standard: 'Weekly review every Sunday' },
  ]
}

export function seedProjects(): Project[] {
  return [
    {
      id: makeId(),
      title: 'Launch personal website',
      description: 'Design, build, and ship a portfolio site.',
      area: 'Career',
      status: 'active',
      dueDate: daysFromNowISO(12),
      createdAt: daysAgoISO(20),
      archived: false,
    },
    {
      id: makeId(),
      title: 'Marathon training block',
      description: '12-week plan building to race day.',
      area: 'Health',
      status: 'active',
      dueDate: daysFromNowISO(45),
      createdAt: daysAgoISO(15),
      archived: false,
    },
    {
      id: makeId(),
      title: 'Q3 budget overhaul',
      description: 'Rebuild the household budget and automate savings.',
      area: 'Finance',
      status: 'on-hold',
      dueDate: daysFromNowISO(30),
      createdAt: daysAgoISO(9),
      archived: false,
    },
    {
      id: makeId(),
      title: 'Read 12 books this year',
      description: 'One nonfiction, one fiction each month.',
      area: 'Learning',
      status: 'active',
      dueDate: null,
      createdAt: daysAgoISO(200),
      archived: false,
    },
    {
      id: makeId(),
      title: 'Kitchen renovation',
      description: 'Completed last spring.',
      area: 'Personal',
      status: 'done',
      dueDate: daysAgoISO(120),
      createdAt: daysAgoISO(200),
      archived: true,
    },
  ]
}

export function seedResources(): Resource[] {
  return [
    {
      id: makeId(),
      title: 'Building a Second Brain — Tiago Forte',
      url: 'https://www.buildingasecondbrain.com/',
      notes: 'Source method for PARA: Projects, Areas, Resources, Archives.',
      tags: ['productivity', 'para', 'book'],
      createdAt: daysAgoISO(60),
      archived: false,
    },
    {
      id: makeId(),
      title: 'Zone 2 training explainer',
      url: 'https://example.com/zone-2',
      notes: 'Reference for marathon training heart-rate zones.',
      tags: ['health', 'running'],
      createdAt: daysAgoISO(10),
      archived: false,
    },
    {
      id: makeId(),
      title: 'Index fund comparison sheet',
      url: 'https://example.com/index-funds',
      notes: 'Expense ratios across low-cost providers.',
      tags: ['finance', 'investing'],
      createdAt: daysAgoISO(40),
      archived: false,
    },
    {
      id: makeId(),
      title: 'CSS Grid cheatsheet',
      url: 'https://example.com/css-grid',
      notes: 'Quick reference used while building the portfolio site.',
      tags: ['career', 'web'],
      createdAt: daysAgoISO(3),
      archived: false,
    },
  ]
}

export function seedTasks(projects: Project[]): Task[] {
  const bySlug = (title: string) => projects.find((p) => p.title === title)?.id ?? null
  const website = bySlug('Launch personal website')
  const marathon = bySlug('Marathon training block')
  const budget = bySlug('Q3 budget overhaul')
  const books = bySlug('Read 12 books this year')

  return [
    { id: makeId(), title: 'Wireframe homepage layout', status: 'done', priority: 'medium', projectId: website, dueDate: daysAgoISO(5), createdAt: daysAgoISO(18) },
    { id: makeId(), title: 'Write project case studies', status: 'in-progress', priority: 'high', projectId: website, dueDate: daysFromNowISO(3), createdAt: daysAgoISO(10) },
    { id: makeId(), title: 'Set up hosting + domain', status: 'todo', priority: 'medium', projectId: website, dueDate: daysFromNowISO(7), createdAt: daysAgoISO(8) },
    { id: makeId(), title: 'Long run — 14 miles', status: 'todo', priority: 'high', projectId: marathon, dueDate: daysFromNowISO(2), createdAt: daysAgoISO(5) },
    { id: makeId(), title: 'Book physio check-in', status: 'todo', priority: 'low', projectId: marathon, dueDate: daysFromNowISO(9), createdAt: daysAgoISO(4) },
    { id: makeId(), title: 'Export last 3 months of transactions', status: 'in-progress', priority: 'medium', projectId: budget, dueDate: daysFromNowISO(1), createdAt: daysAgoISO(6) },
    { id: makeId(), title: 'Finish "Atomic Habits"', status: 'in-progress', priority: 'low', projectId: books, dueDate: daysFromNowISO(14), createdAt: daysAgoISO(20) },
    { id: makeId(), title: 'Reply to Sam re: catch-up', status: 'todo', priority: 'medium', projectId: null, dueDate: todayISO(), createdAt: daysAgoISO(1) },
    { id: makeId(), title: 'Renew passport', status: 'todo', priority: 'high', projectId: null, dueDate: daysFromNowISO(20), createdAt: daysAgoISO(2) },
  ]
}

export function seedNotes(): Note[] {
  return [
    {
      id: makeId(),
      title: 'PARA method — quick reference',
      content:
        'Projects: short-term efforts with a goal and deadline.\nAreas: standards to maintain over time.\nResources: topics of ongoing interest.\nArchive: inactive items from the above three.',
      tags: ['productivity', 'para'],
      createdAt: daysAgoISO(55),
      updatedAt: daysAgoISO(30),
    },
    {
      id: makeId(),
      title: 'Marathon fueling notes',
      content: 'Aim for 60-90g carbs/hour on long runs. Practice race-day nutrition on every run over 10 miles.',
      tags: ['health', 'running'],
      createdAt: daysAgoISO(12),
      updatedAt: daysAgoISO(2),
    },
    {
      id: makeId(),
      title: 'Portfolio site — content ideas',
      content: 'Case studies: dashboard redesign, API migration, onboarding flow. Keep write-ups under 400 words each.',
      tags: ['career', 'web'],
      createdAt: daysAgoISO(9),
      updatedAt: daysAgoISO(1),
    },
    {
      id: makeId(),
      title: 'Weekly review template',
      content: '1) Clear inboxes 2) Review calendar 3) Update project statuses 4) Pick top 3 priorities for next week.',
      tags: ['personal', 'review'],
      createdAt: daysAgoISO(70),
      updatedAt: daysAgoISO(7),
    },
  ]
}

export function seedHabits(): Habit[] {
  return [
    { id: makeId(), name: 'Move for 30 min', color: 'var(--series-3)', createdAt: daysAgoISO(60), archived: false },
    { id: makeId(), name: 'Read', color: 'var(--series-1)', createdAt: daysAgoISO(60), archived: false },
    { id: makeId(), name: 'No sugar', color: 'var(--series-4)', createdAt: daysAgoISO(45), archived: false },
    { id: makeId(), name: 'Journal', color: 'var(--series-7)', createdAt: daysAgoISO(30), archived: false },
  ]
}

export function seedHabitLogs(habits: Habit[]): HabitLog[] {
  const logs: HabitLog[] = []
  habits.forEach((habit, hi) => {
    for (let i = 0; i < 28; i++) {
      // deterministic pseudo-random-ish pattern so the grid looks realistic
      const shouldLog = (i + hi * 2) % 3 !== 0
      if (shouldLog) {
        logs.push({ id: makeId(), habitId: habit.id, date: daysAgoISO(i) })
      }
    }
  })
  return logs
}

export function seedJournal(): JournalEntry[] {
  return [
    { id: makeId(), date: daysAgoISO(0), mood: 4, content: 'Good focus today. Made progress on the case studies for the site.', createdAt: daysAgoISO(0) },
    { id: makeId(), date: daysAgoISO(1), mood: 3, content: 'Slept badly, dragged through the morning. Still got the long run in.', createdAt: daysAgoISO(1) },
    { id: makeId(), date: daysAgoISO(2), mood: 5, content: 'Great weekly review. Feeling clear on priorities for next week.', createdAt: daysAgoISO(2) },
    { id: makeId(), date: daysAgoISO(4), mood: 3, content: 'Budget spreadsheet is a mess. Need to block real time for it.', createdAt: daysAgoISO(4) },
  ]
}

export function seedGoals(): Goal[] {
  return [
    { id: makeId(), title: 'Run a sub-4-hour marathon', area: 'Health', status: 'in-progress', progress: 55, targetDate: daysFromNowISO(45), createdAt: daysAgoISO(60) },
    { id: makeId(), title: 'Ship personal portfolio site', area: 'Career', status: 'in-progress', progress: 70, targetDate: daysFromNowISO(12), createdAt: daysAgoISO(20) },
    { id: makeId(), title: 'Build 6-month emergency fund', area: 'Finance', status: 'in-progress', progress: 40, targetDate: daysFromNowISO(150), createdAt: daysAgoISO(90) },
    { id: makeId(), title: 'Read 12 books', area: 'Learning', status: 'in-progress', progress: 33, targetDate: daysFromNowISO(300), createdAt: daysAgoISO(200) },
    { id: makeId(), title: 'Call parents weekly', area: 'Relationships', status: 'in-progress', progress: 80, targetDate: null, createdAt: daysAgoISO(150) },
    { id: makeId(), title: 'Declutter home office', area: 'Personal', status: 'not-started', progress: 0, targetDate: daysFromNowISO(21), createdAt: daysAgoISO(3) },
  ]
}

export function seedInbox(): InboxItem[] {
  return [
    { id: makeId(), content: 'Look into a standing desk for the home office', createdAt: daysAgoISO(1) },
    { id: makeId(), content: 'Podcast rec from Sam — "Deep Questions"', createdAt: daysAgoISO(0) },
    { id: makeId(), content: 'Ask accountant about Q3 estimated taxes', createdAt: daysAgoISO(2) },
  ]
}

export function seedWeeklyFocus(): WeeklyFocus[] {
  return [
    {
      id: makeId(),
      weekStart: currentWeekStartISO(),
      priorities: [
        'Finish portfolio site case studies',
        'Long run — 14 miles',
        'Close out Q3 budget export',
      ],
      notes: 'Keep mornings for deep work on the site before runs get long.',
    },
  ]
}

export function seedMonthlyReviews(): MonthlyReview[] {
  return [
    {
      id: makeId(),
      month: currentMonthISO(),
      wins: 'Shipped the homepage wireframe. Training block is on schedule.',
      challenges: 'Budget review keeps slipping — need a dedicated block, not leftover time.',
      focusNext: 'Ship the portfolio site and lock the marathon taper plan.',
      createdAt: daysAgoISO(3),
    },
  ]
}

export function seedMedia(): MediaItem[] {
  return [
    {
      id: makeId(),
      title: 'Atomic Habits',
      type: 'book',
      status: 'in-progress',
      rating: 0,
      url: '',
      notes: 'Reading a chapter most evenings.',
      createdAt: daysAgoISO(20),
      finishedAt: null,
    },
    {
      id: makeId(),
      title: 'Deep Work',
      type: 'book',
      status: 'done',
      rating: 5,
      url: '',
      notes: 'Reread for the third time — still the best framing on focus.',
      createdAt: daysAgoISO(90),
      finishedAt: daysAgoISO(60),
    },
    {
      id: makeId(),
      title: 'How I structure a marathon training block',
      type: 'video',
      status: 'done',
      rating: 4,
      url: 'https://example.com/marathon-video',
      notes: 'Good baseline for the 12-week plan.',
      createdAt: daysAgoISO(15),
      finishedAt: daysAgoISO(14),
    },
    {
      id: makeId(),
      title: 'Deep Questions with Cal Newport',
      type: 'podcast',
      status: 'want',
      rating: 0,
      url: '',
      notes: 'Recommended by Sam.',
      createdAt: daysAgoISO(0),
      finishedAt: null,
    },
    {
      id: makeId(),
      title: 'A field guide to index funds',
      type: 'article',
      status: 'want',
      rating: 0,
      url: 'https://example.com/index-funds-guide',
      notes: '',
      createdAt: daysAgoISO(5),
      finishedAt: null,
    },
  ]
}

export function seedTransactions(): Transaction[] {
  return [
    { id: makeId(), date: daysAgoISO(1), description: 'Paycheck', category: 'Income', type: 'income', amount: 3200, createdAt: daysAgoISO(1) },
    { id: makeId(), date: daysAgoISO(2), description: 'Rent', category: 'Housing', type: 'expense', amount: 1450, createdAt: daysAgoISO(2) },
    { id: makeId(), date: daysAgoISO(3), description: 'Groceries', category: 'Food', type: 'expense', amount: 96.4, createdAt: daysAgoISO(3) },
    { id: makeId(), date: daysAgoISO(4), description: 'Running shoes', category: 'Health', type: 'expense', amount: 140, createdAt: daysAgoISO(4) },
    { id: makeId(), date: daysAgoISO(5), description: 'Electric bill', category: 'Housing', type: 'expense', amount: 78.2, createdAt: daysAgoISO(5) },
    { id: makeId(), date: daysAgoISO(6), description: 'Dinner out', category: 'Food', type: 'expense', amount: 62, createdAt: daysAgoISO(6) },
    { id: makeId(), date: daysAgoISO(7), description: 'Freelance invoice', category: 'Income', type: 'income', amount: 450, createdAt: daysAgoISO(7) },
    { id: makeId(), date: daysAgoISO(8), description: 'Index fund contribution', category: 'Savings', type: 'expense', amount: 400, createdAt: daysAgoISO(8) },
    { id: makeId(), date: daysAgoISO(9), description: 'Phone bill', category: 'Subscriptions', type: 'expense', amount: 55, createdAt: daysAgoISO(9) },
    { id: makeId(), date: daysAgoISO(10), description: 'Gas', category: 'Transport', type: 'expense', amount: 48.5, createdAt: daysAgoISO(10) },
  ]
}

export function seedFinanceSettings(): FinanceSettings {
  return { monthlyBudget: 2400, currency: 'GBP' }
}

export function seedTools(): Tool[] {
  return [
    { id: makeId(), name: 'Coolors', url: 'https://coolors.co', category: 'Design', createdAt: daysAgoISO(40) },
    { id: makeId(), name: 'Noisli', url: 'https://noisli.com', category: 'Focus', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'IFTTT', url: 'https://ifttt.com', category: 'Automation', createdAt: daysAgoISO(25) },
    { id: makeId(), name: 'Deepstash', url: 'https://deepstash.com', category: 'Learning', createdAt: daysAgoISO(15) },
    { id: makeId(), name: 'Socratic', url: 'https://socratic.org', category: 'Learning', createdAt: daysAgoISO(10) },
  ]
}

export function seedContacts(): Contact[] {
  return [
    { id: makeId(), name: 'Sam', phone: '+1 555-0134', email: 'sam@example.com', tag: 'Friends', createdAt: daysAgoISO(80) },
    { id: makeId(), name: 'Mom', phone: '+1 555-0198', email: '', tag: 'Family', createdAt: daysAgoISO(200) },
    { id: makeId(), name: 'Alex (accountant)', phone: '+1 555-0110', email: 'alex@example.com', tag: 'Services', createdAt: daysAgoISO(60) },
    { id: makeId(), name: 'Jordan', phone: '+1 555-0177', email: '', tag: 'Work', createdAt: daysAgoISO(20) },
  ]
}

export function seedLearningSpheres(): LearningSphere[] {
  return [
    { id: makeId(), name: 'Investing', area: 'Finance', createdAt: daysAgoISO(50) },
    { id: makeId(), name: 'Programming', area: 'Career', createdAt: daysAgoISO(70) },
    { id: makeId(), name: 'Nutrition', area: 'Health', createdAt: daysAgoISO(35) },
  ]
}

export function seedSphereTopics(spheres: LearningSphere[]): SphereTopic[] {
  const bySlug = (name: string) => spheres.find((s) => s.name === name)?.id ?? ''
  return [
    { id: makeId(), title: 'Index fund basics', sphereId: bySlug('Investing'), done: true, createdAt: daysAgoISO(45) },
    { id: makeId(), title: 'Tax-advantaged accounts', sphereId: bySlug('Investing'), done: false, createdAt: daysAgoISO(30) },
    { id: makeId(), title: 'TypeScript generics', sphereId: bySlug('Programming'), done: true, createdAt: daysAgoISO(60) },
    { id: makeId(), title: 'CSS Grid layouts', sphereId: bySlug('Programming'), done: false, createdAt: daysAgoISO(20) },
    { id: makeId(), title: 'Macro tracking basics', sphereId: bySlug('Nutrition'), done: false, createdAt: daysAgoISO(15) },
  ]
}

export function seedPapers(): Paper[] {
  return [
    { id: makeId(), title: 'How to Do Great Work', url: 'https://paulgraham.com/greatwork.html', type: 'Essay', area: 'Career', createdAt: daysAgoISO(20) },
    { id: makeId(), title: 'The Psychology of Money', url: 'https://collabfund.com/blog/the-psychology-of-money', type: 'Web article', area: 'Finance', createdAt: daysAgoISO(35) },
    { id: makeId(), title: 'Why Procrastinators Procrastinate', url: 'https://waitbutwhy.com/2013/10/why-procrastinators-procrastinate.html', type: 'Guide', area: 'Personal', createdAt: daysAgoISO(50) },
  ]
}

export function seedWorkoutDays(): WorkoutDay[] {
  return [
    { id: makeId(), name: 'Push Day', dayOfWeek: 'Monday', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'Pull Day', dayOfWeek: 'Tuesday', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'Leg Day', dayOfWeek: 'Thursday', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'Rest / Mobility', dayOfWeek: 'Sunday', createdAt: daysAgoISO(30) },
  ]
}

export function seedExercises(workoutDays: WorkoutDay[]): Exercise[] {
  const push = workoutDays[0].id
  const pull = workoutDays[1].id
  const legs = workoutDays[2].id
  const rest = workoutDays[3].id
  const mk = (workoutDayId: string, name: string, sets: number, reps: number, weight: string): Exercise => ({
    id: makeId(),
    workoutDayId,
    name,
    sets,
    reps,
    weight,
    done: false,
    createdAt: daysAgoISO(30),
  })
  return [
    mk(push, 'Bench press', 4, 8, '60kg'),
    mk(push, 'Overhead press', 3, 10, '30kg'),
    mk(push, 'Incline dumbbell press', 3, 10, '20kg'),
    mk(push, 'Triceps pushdown', 3, 12, '25kg'),
    mk(pull, 'Deadlift', 4, 6, '100kg'),
    mk(pull, 'Pull-ups', 4, 8, 'Bodyweight'),
    mk(pull, 'Barbell row', 3, 10, '50kg'),
    mk(pull, 'Bicep curl', 3, 12, '12kg'),
    mk(legs, 'Squat', 4, 8, '80kg'),
    mk(legs, 'Romanian deadlift', 3, 10, '60kg'),
    mk(legs, 'Leg press', 3, 12, '120kg'),
    mk(legs, 'Calf raise', 4, 15, '40kg'),
    mk(rest, 'Stretching / foam rolling', 1, 1, '15 min'),
    mk(rest, 'Walk', 1, 1, '30 min'),
  ]
}

export function seedMeals(): Meal[] {
  return [
    { id: makeId(), name: 'Breakfast', time: '07:30', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'Lunch', time: '12:30', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'Dinner', time: '19:00', createdAt: daysAgoISO(30) },
    { id: makeId(), name: 'Snacks', time: 'Anytime', createdAt: daysAgoISO(30) },
  ]
}

export function seedFoodItems(meals: Meal[]): FoodItem[] {
  const breakfast = meals[0].id
  const lunch = meals[1].id
  const dinner = meals[2].id
  const snacks = meals[3].id
  const mk = (mealId: string, name: string, calories: number, protein: number): FoodItem => ({
    id: makeId(),
    mealId,
    name,
    calories,
    protein,
    done: false,
    createdAt: daysAgoISO(30),
  })
  return [
    mk(breakfast, 'Porridge with banana', 350, 12),
    mk(breakfast, 'Greek yoghurt', 150, 15),
    mk(lunch, 'Grilled chicken breast', 250, 40),
    mk(lunch, 'Rice', 200, 4),
    mk(lunch, 'Mixed vegetables', 80, 3),
    mk(dinner, 'Salmon fillet', 350, 35),
    mk(dinner, 'Sweet potato', 180, 3),
    mk(dinner, 'Broccoli', 55, 4),
    mk(snacks, 'Protein shake', 150, 25),
    mk(snacks, 'Almonds (30g)', 170, 6),
  ]
}

export function makeBusinessLawExtras(): { project: Project; tasks: Task[] } {
  const projectId = makeId()
  const now = new Date().toISOString()

  const project: Project = {
    id: projectId,
    title: 'ACA Business Law Exam Prep',
    description:
      '2-week study plan for the ACA Business Law exam (target 29–30 Aug 2026). Daily: Kaplan learn → timed ICAEW question bank → review/error log.',
    area: 'Learning',
    status: 'active',
    dueDate: '2026-08-29',
    createdAt: now,
    archived: false,
  }

  const days: { date: string; title: string; priority: Task['priority'] }[] = [
    { date: '2026-08-11', title: 'Legal system fundamentals (sources of law, courts, precedent)', priority: 'medium' },
    { date: '2026-08-12', title: 'Contract formation (offer/acceptance/consideration/intention)', priority: 'medium' },
    { date: '2026-08-13', title: 'Contract terms + incorporation/interpretation', priority: 'medium' },
    { date: '2026-08-14', title: 'Exclusion clauses + unfair terms / consumer protection', priority: 'medium' },
    { date: '2026-08-15', title: 'Mixed timed set + weak-topic repair (long weekend session)', priority: 'medium' },
    { date: '2026-08-16', title: 'Mixed timed set + re-do wrong Qs + Top Rules & Traps sheet', priority: 'medium' },
    { date: '2026-08-17', title: 'Misrepresentation + remedies', priority: 'medium' },
    { date: '2026-08-18', title: 'Duress / undue influence / mistake', priority: 'medium' },
    { date: '2026-08-19', title: 'Agency (authority, duties, liability)', priority: 'medium' },
    { date: '2026-08-20', title: 'Employment basics', priority: 'medium' },
    { date: '2026-08-21', title: 'Tort / negligence / vicarious liability / occupiers', priority: 'medium' },
    { date: '2026-08-22', title: 'Big mixed timed set + Kaplan weakest-area repair (long session)', priority: 'high' },
    { date: '2026-08-23', title: 'Mini-mock mixed set + reattempt wrong Qs + polish Top Rules & Traps', priority: 'high' },
    { date: '2026-08-24', title: 'Consolidation night — mixed timed set + heavy review', priority: 'high' },
    { date: '2026-08-25', title: 'Weak Area #1 repair + targeted timed QB', priority: 'high' },
    { date: '2026-08-26', title: 'Mixed timed set + review', priority: 'high' },
    { date: '2026-08-27', title: 'Weak Area #2 repair + targeted timed QB', priority: 'high' },
    { date: '2026-08-28', title: 'Error log + Top Rules & Traps + light confidence set', priority: 'high' },
    { date: '2026-08-29', title: 'ACA Business Law exam', priority: 'high' },
  ]

  const tasks: Task[] = days.map(({ date, title, priority }) => ({
    id: makeId(),
    title,
    status: 'todo',
    priority,
    projectId,
    dueDate: date,
    createdAt: now,
  }))

  return { project, tasks }
}

export { LIFE_AREAS }
