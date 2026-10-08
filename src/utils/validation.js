export const TASK_STATUSES = ['Offen', 'In Arbeit', 'Geplant', 'Erledigt', 'Überfällig']
export const TASK_CATEGORIES = ['Social Media', 'Grafik', 'Foto', 'Video', 'Text', 'Sonstiges']

export function validateMatch(form) {
  const errors = {}

  if (!form.homeTeam?.trim()) errors.homeTeam = 'Bitte gib das Heimteam ein.'
  if (!form.awayTeam?.trim()) errors.awayTeam = 'Bitte gib das Auswärtsteam ein.'

  if (
    form.homeTeam?.trim() &&
    form.awayTeam?.trim() &&
    form.homeTeam.trim().toLowerCase() === form.awayTeam.trim().toLowerCase()
  ) {
    errors.awayTeam = 'Heim- und Auswärtsteam müssen verschieden sein.'
  }

  if (!form.date) errors.date = 'Bitte wähle ein Datum.'
  if (!form.time) errors.time = 'Bitte wähle eine Anspielzeit.'

  return errors
}

export function validateTask(form) {
  const errors = {}

  if (!form.title?.trim()) errors.title = 'Bitte gib einen Aufgabentitel ein.'
  if (!form.matchId) errors.matchId = 'Bitte wähle ein Match.'
  if (!TASK_CATEGORIES.includes(form.category)) errors.category = 'Bitte wähle eine gültige Kategorie.'
  if (!TASK_STATUSES.includes(form.status)) errors.status = 'Bitte wähle einen gültigen Status.'

  return errors
}

export function calculateProgress(tasks) {
  if (!tasks.length) return 0
  const done = tasks.filter((task) => task.status === 'Erledigt').length
  return Math.round((done / tasks.length) * 100)
}
