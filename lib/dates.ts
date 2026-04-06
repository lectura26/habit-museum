export function getGreeting(firstName: string): string {
  const hour = new Date().getHours()
  const timeWord = hour < 12 ? 'MORNING' : hour < 17 ? 'AFTERNOON' : 'EVENING'
  const name = firstName ? firstName.toUpperCase() : ''
  return `GOOD ${timeWord}${name ? ', ' + name : ''}`
}

export function formatDate(date = new Date()): string {
  const days = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY']
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER']
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function toLocalDateString(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getYesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return toLocalDateString(d)
}

export function getTomorrowString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return toLocalDateString(d)
}

export function getWeekStart(date = new Date()): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getMonthStart(date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function isSundayAfter6PM(): boolean {
  const now = new Date()
  return now.getDay() === 0 && now.getHours() >= 18
}
