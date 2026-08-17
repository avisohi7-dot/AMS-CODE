function toLocalISODate(d: Date): string {
  const offset = d.getTimezoneOffset()
  const local = new Date(d.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export function currentWeekStartISO(): string {
  const d = new Date()
  const day = d.getDay() // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diffToMonday)
  return toLocalISODate(d)
}

export function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatWeekLabel(weekStartISO: string): string {
  const start = new Date(weekStartISO + 'T00:00:00')
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function formatMonthLabel(monthISO: string): string {
  const [y, m] = monthISO.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export function isDateInWeek(dateISO: string, weekStartISO: string): boolean {
  const d = new Date(dateISO + 'T00:00:00').getTime()
  const start = new Date(weekStartISO + 'T00:00:00').getTime()
  const end = start + 6 * 24 * 60 * 60 * 1000
  return d >= start && d <= end
}

export function isDateInMonth(dateISO: string, monthISO: string): boolean {
  return dateISO.startsWith(monthISO)
}

export function monthGrid(monthISO: string): string[] {
  const [y, m] = monthISO.split('-').map(Number)
  const firstOfMonth = new Date(y, m - 1, 1)
  const day = firstOfMonth.getDay() // 0 = Sunday
  const startOffset = day === 0 ? 6 : day - 1 // Monday-first grid
  const gridStart = new Date(y, m - 1, 1 - startOffset)
  const days: string[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    days.push(toLocalISODate(d))
  }
  return days
}

export function shiftMonth(monthISO: string, delta: number): string {
  const [y, m] = monthISO.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
