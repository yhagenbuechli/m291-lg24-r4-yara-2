import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { calculateProgress } from '@/utils/validation'

// Alle Daten (Matches, Aufgaben, Vorlagen) werden im Local Storage des Browsers gespeichert.
// Es gibt keine eigene API und keine Datenbank. Externe Spieldaten kommen direkt von OpenLigaDB.
const STORAGE_KEY = 'matchday-planner-data'
const OPENLIGA_BASE = 'https://api.openligadb.de'

function readStorage() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { matches: [], tasks: [], templates: [] }

  const data = JSON.parse(raw)
  return {
    matches: Array.isArray(data.matches) ? data.matches : [],
    tasks: Array.isArray(data.tasks) ? data.tasks : [],
    templates: Array.isArray(data.templates) ? data.templates : [],
  }
}

function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

function cleanMatch(form) {
  return {
    externalId: form.externalId ?? null,
    homeTeam: form.homeTeam.trim(),
    awayTeam: form.awayTeam.trim(),
    competition: form.competition?.trim() || '',
    date: form.date,
    time: form.time,
    stadium: form.stadium?.trim() || '',
  }
}

function cleanTask(form) {
  return {
    matchId: Number(form.matchId),
    title: form.title.trim(),
    category: form.category,
    status: form.status,
    publishTime: form.publishTime || '',
    notes: form.notes?.trim() || '',
  }
}

export const useMatchStore = defineStore('match', () => {
  const matches = ref([])
  const tasks = ref([])
  const templates = ref([])
  const loading = ref(false)
  const error = ref('')
  const initialized = ref(false)

  // ---------- Abgeleitete Werte ----------
  const nextMatch = computed(() => {
    if (!matches.value.length) return null

    const now = new Date()
    const sorted = [...matches.value].sort((a, b) => {
      return new Date(`${a.date}T${a.time || '00:00'}`) - new Date(`${b.date}T${b.time || '00:00'}`)
    })

    return (
      sorted.find((match) => new Date(`${match.date}T${match.time || '23:59'}`) >= now) ??
      sorted.at(-1)
    )
  })

  const tasksForNextMatch = computed(() => {
    if (!nextMatch.value) return []
    return tasks.value.filter((task) => task.matchId === nextMatch.value.id)
  })

  const openTasks = computed(() => tasksForNextMatch.value.filter((task) => task.status !== 'Erledigt'))

  const completedCount = computed(
    () => tasksForNextMatch.value.filter((task) => task.status === 'Erledigt').length,
  )

  const totalTaskCount = computed(() => tasksForNextMatch.value.length)
  const progress = computed(() => calculateProgress(tasksForNextMatch.value))

  // ---------- Laden und Speichern ----------
  function loadAll() {
    if (initialized.value) return

    loading.value = true
    error.value = ''

    try {
      const data = readStorage()
      matches.value = data.matches
      tasks.value = data.tasks
      templates.value = data.templates
    } catch {
      error.value = 'Die gespeicherten Daten konnten nicht gelesen werden.'
    } finally {
      initialized.value = true
      loading.value = false
    }
  }

  function persist() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ matches: matches.value, tasks: tasks.value, templates: templates.value }),
      )
    } catch {
      throw new Error('Speichern im Browser nicht möglich (z. B. privater Modus oder Speicher voll).')
    }
  }

  // ---------- Lesen ----------
  function getMatchById(id) {
    return matches.value.find((match) => match.id === Number(id)) ?? null
  }

  function getMatchLabel(id) {
    const match = getMatchById(id)
    return match ? `${match.homeTeam} – ${match.awayTeam}` : 'Unbekanntes Match'
  }

  function getTasksForMatch(id) {
    return tasks.value.filter((task) => task.matchId === Number(id))
  }

  function getProgressForMatch(id) {
    return calculateProgress(getTasksForMatch(id))
  }

  // ---------- Matches ----------
  async function createMatch(form) {
    if (form.externalId && matches.value.some((match) => match.externalId === form.externalId)) {
      throw new Error('Dieses OpenLigaDB-Spiel wurde bereits übernommen.')
    }

    const match = { id: nextId(matches.value), ...cleanMatch(form), createdAt: new Date().toISOString() }
    matches.value.push(match)
    try {
      persist()
    } catch (err) {
      matches.value.pop()
      throw err
    }
    return match
  }

  // ---------- Aufgaben ----------
  async function createTask(form) {
    if (!getMatchById(form.matchId)) throw new Error('Das gewählte Match existiert nicht.')

    const task = { id: nextId(tasks.value), ...cleanTask(form), createdAt: new Date().toISOString() }
    tasks.value.push(task)
    try {
      persist()
    } catch (err) {
      tasks.value.pop()
      throw err
    }
    return task
  }

  async function updateTaskStatus(taskId, status) {
    const task = tasks.value.find((item) => item.id === Number(taskId))
    if (!task) throw new Error('Aufgabe nicht gefunden.')

    const previous = task.status
    task.status = status

    try {
      persist()
    } catch (err) {
      task.status = previous
      throw err
    }
  }

  async function updateTask(taskId, form) {
    const task = tasks.value.find((item) => item.id === Number(taskId))
    if (!task) throw new Error('Aufgabe nicht gefunden.')
    if (!getMatchById(form.matchId)) throw new Error('Das gewählte Match existiert nicht.')

    const previous = { ...task }
    Object.assign(task, cleanTask(form))

    try {
      persist()
    } catch (err) {
      Object.assign(task, previous)
      throw err
    }
    return task
  }

  async function deleteTask(taskId) {
    const previous = tasks.value
    tasks.value = tasks.value.filter((task) => task.id !== Number(taskId))

    try {
      persist()
    } catch (err) {
      tasks.value = previous
      throw err
    }
  }

  // ---------- Vorlagen ----------
  async function createTemplate(form) {
    const template = {
      id: nextId(templates.value),
      name: form.name.trim(),
      description: form.description?.trim() || '',
      createdAt: new Date().toISOString(),
    }
    templates.value.push(template)
    try {
      persist()
    } catch (err) {
      templates.value.pop()
      throw err
    }
    return template
  }

  // ---------- Externe API: OpenLigaDB ----------
  async function loadExternalMatches({ league = 'bl1', season = new Date().getFullYear() } = {}) {
    let response
    try {
      response = await fetch(
        `${OPENLIGA_BASE}/getmatchdata/${encodeURIComponent(league)}/${encodeURIComponent(season)}`,
        { headers: { Accept: 'application/json' } },
      )
    } catch {
      throw new Error('OpenLigaDB ist nicht erreichbar. Prüfe die Internetverbindung und versuche es erneut.')
    }

    if (!response.ok) {
      throw new Error(`OpenLigaDB antwortet mit Fehler ${response.status}. Versuche es später erneut.`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) throw new Error('OpenLigaDB lieferte unerwartete Daten.')

    return data.map((item) => ({
      externalId: Number(item.matchID),
      homeTeam: item.team1?.teamName || 'Heimteam',
      awayTeam: item.team2?.teamName || 'Auswärtsteam',
      competition: item.leagueName || league,
      date: String(item.matchDateTime || '').slice(0, 10),
      time: String(item.matchDateTime || '').slice(11, 16),
      stadium: item.location?.locationStadium || item.location?.locationCity || '',
    }))
  }

  // Änderungen in anderen Tabs übernehmen
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY) return
      initialized.value = false
      loadAll()
    })
  }

  return {
    matches,
    tasks,
    templates,
    loading,
    error,
    initialized,
    nextMatch,
    tasksForNextMatch,
    openTasks,
    completedCount,
    totalTaskCount,
    progress,
    loadAll,
    getMatchById,
    getMatchLabel,
    getTasksForMatch,
    getProgressForMatch,
    createMatch,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    createTemplate,
    loadExternalMatches,
  }
})
