// Gemeinsame Formatierungs- und Hilfsfunktionen für Datum, Zeit und Aufgaben.

function parseDateTime(value) {
  if (!value) return null
  const normalized = String(value).trim().replace(' ', 'T')
  const date = new Date(normalized.length === 10 ? `${normalized}T12:00:00` : normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  const date = parseDateTime(value)
  return date ? new Intl.DateTimeFormat('de-CH', options).format(date) : ''
}

export function formatLongDate(value) {
  return formatDate(value, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })
}

export function formatDateTime(value) {
  const date = parseDateTime(value)
  if (!date) return ''
  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

// "2026-10-18 14:00:00" → "2026-10-18T14:00" für <input type="datetime-local">
export function toInputDateTime(value) {
  if (!value) return ''
  return String(value).trim().replace(' ', 'T').slice(0, 16)
}

// Veröffentlichungszeit vorbei, Aufgabe aber noch nicht erledigt
export function isPublishTimePassed(task, now = new Date()) {
  if (!task?.publishTime || task.status === 'Erledigt') return false
  const date = parseDateTime(task.publishTime)
  return Boolean(date) && date < now
}

export const SORT_OPTIONS = [
  { value: 'publish', label: 'Veröffentlichung (früheste zuerst)' },
  { value: 'newest', label: 'Neueste zuerst' },
  { value: 'title', label: 'Titel A–Z' },
  { value: 'status', label: 'Status' },
]

const STATUS_ORDER = ['Überfällig', 'Offen', 'In Arbeit', 'Geplant', 'Erledigt']

export function sortTasks(tasks, sortBy = 'publish') {
  const list = [...tasks]

  if (sortBy === 'title') {
    return list.sort((a, b) => a.title.localeCompare(b.title, 'de-CH'))
  }

  if (sortBy === 'newest') {
    return list.sort((a, b) => b.id - a.id)
  }

  if (sortBy === 'status') {
    return list.sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status))
  }

  // publish: Aufgaben ohne Zeit ans Ende
  return list.sort((a, b) => {
    const timeA = parseDateTime(a.publishTime)?.getTime() ?? Infinity
    const timeB = parseDateTime(b.publishTime)?.getTime() ?? Infinity
    return timeA - timeB
  })
}

export function filterTasks(tasks, { search = '', matchId = 'Alle', category = 'Alle', status = 'Alle' } = {}) {
  const query = search.trim().toLowerCase()

  return tasks.filter((task) => {
    const matchFits = matchId === 'Alle' || task.matchId === Number(matchId)
    const categoryFits = category === 'Alle' || task.category === category
    const statusFits = status === 'Alle' || task.status === status
    const searchFits =
      !query || task.title.toLowerCase().includes(query) || task.notes.toLowerCase().includes(query)

    return matchFits && categoryFits && statusFits && searchFits
  })
}
