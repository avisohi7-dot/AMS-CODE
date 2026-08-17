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
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

export function formatMonthLabel(monthISO: string): string {
  const [y, m] = monthISO.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
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
