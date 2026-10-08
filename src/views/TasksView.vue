<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppAlert from '@/components/AppAlert.vue'
import AppIcon from '@/components/AppIcon.vue'
import AppModal from '@/components/AppModal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskDialogs from '@/components/TaskDialogs.vue'
import TaskForm from '@/components/TaskForm.vue'
import { useMatchStore } from '@/stores/matchStore'
import { SORT_OPTIONS, filterTasks, sortTasks } from '@/utils/format'
import { calculateProgress, TASK_CATEGORIES, TASK_STATUSES } from '@/utils/validation'

const route = useRoute()
const store = useMatchStore()
const { tasks, matches, loading, error } = storeToRefs(store)

// ---------- Filter, Suche, Sortierung ----------
const search = ref('')
const matchFilter = ref(route.query.match ? Number(route.query.match) : 'Alle')
const category = ref('Alle')
const status = ref('Alle')
const sortBy = ref('publish')

const VIEW_KEY = 'matchday-tasks-view'
function readView() {
  try {
    return localStorage.getItem(VIEW_KEY) === 'board' ? 'board' : 'list'
  } catch {
    return 'list'
  }
}
const view = ref(readView())
watch(view, (value) => {
  try {
    localStorage.setItem(VIEW_KEY, value)
  } catch {
    // Speichern nicht möglich (z. B. privater Modus) – Ansicht gilt dann nur für diese Sitzung
  }
})

const filteredTasks = computed(() =>
  sortTasks(
    filterTasks(tasks.value, {
      search: search.value,
      matchId: matchFilter.value,
      category: category.value,
      status: status.value,
    }),
    sortBy.value,
  ),
)

const sortedMatches = computed(() =>
  [...matches.value].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
)

const activeFilters = computed(() => {
  const list = []
  if (search.value.trim()) list.push({ key: 'search', label: `Suche: «${search.value.trim()}»` })
  if (matchFilter.value !== 'Alle') list.push({ key: 'match', label: `Match: ${store.getMatchLabel(matchFilter.value)}` })
  if (category.value !== 'Alle') list.push({ key: 'category', label: `Kategorie: ${category.value}` })
  if (status.value !== 'Alle') list.push({ key: 'status', label: `Status: ${status.value}` })
  return list
})

function removeFilter(key) {
  if (key === 'search') search.value = ''
  if (key === 'match') matchFilter.value = 'Alle'
  if (key === 'category') category.value = 'Alle'
  if (key === 'status') status.value = 'Alle'
}

function resetFilters() {
  search.value = ''
  matchFilter.value = 'Alle'
  category.value = 'Alle'
  status.value = 'Alle'
}

// ---------- Statusübersicht ----------
const statusCounts = computed(() =>
  TASK_STATUSES.map((name) => ({
    name,
    count: tasks.value.filter((task) => task.status === name).length,
  })),
)
const overallProgress = computed(() => calculateProgress(tasks.value))

function toggleStatus(name) {
  status.value = status.value === name ? 'Alle' : name
}

// ---------- Board ----------
const boardColumns = computed(() =>
  TASK_STATUSES.map((name) => ({
    name,
    tasks: filteredTasks.value.filter((task) => task.status === name),
  })),
)

// ---------- Aktionen ----------
const notice = ref('')
const actionError = ref('')
const creating = ref(false)
const editing = ref(null)
const deleting = ref(null)
let noticeTimer = null

function notify(type, message) {
  if (type === 'error') {
    actionError.value = message
    return
  }
  actionError.value = ''
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => (notice.value = ''), 3500)
}

function onCreated() {
  creating.value = false
  notify('success', 'Aufgabe wurde gespeichert.')
}

async function changeStatus(task, value) {
  actionError.value = ''
  try {
    await store.updateTaskStatus(task.id, value)
    notify('success', `Status von «${task.title}» ist jetzt «${value}».`)
  } catch (err) {
    notify('error', err.message || 'Status konnte nicht gespeichert werden.')
  }
}

onMounted(() => store.loadAll())
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <!-- Kopfbereich -->
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">Produktion</p>
        <h2 class="page-title">Aufgaben</h2>
        <p class="mt-1 text-muted">Plane, filtere und erledige Content-Aufgaben für alle Matchdays.</p>
      </div>
      <button type="button" class="btn btn-primary" @click="creating = true">
        <AppIcon name="plus" :size="18" />
        Neue Aufgabe
      </button>
    </section>

    <!-- Rückmeldungen -->
    <AppAlert v-if="error" type="error" :message="error" />
    <AppAlert v-if="actionError" type="error" :message="actionError" />
    <Transition name="fade">
      <AppAlert v-if="notice" type="success" :message="notice" />
    </Transition>

    <!-- Statusübersicht -->
    <section aria-labelledby="status-overview-title" class="card p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h3 id="status-overview-title" class="font-bold text-primary">Statusübersicht</h3>
        <p class="text-sm text-muted">
          <span class="font-bold text-primary">{{ overallProgress }} %</span> aller Aufgaben erledigt
        </p>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <button
          v-for="item in statusCounts"
          :key="item.name"
          type="button"
          class="flex items-center justify-between gap-2 rounded-xl border px-3 py-3 text-left transition"
          :class="
            status === item.name
              ? 'border-primary bg-primary text-surface'
              : 'border-border bg-surface hover:border-muted'
          "
          :aria-pressed="status === item.name"
          :aria-label="`Nur Status ${item.name} anzeigen (${item.count} Aufgaben)`"
          @click="toggleStatus(item.name)"
        >
          <StatusBadge :status="item.name" />
          <span class="text-xl font-bold">{{ item.count }}</span>
        </button>
      </div>
    </section>

    <!-- Werkzeugleiste -->
    <section aria-label="Filter und Ansicht" class="card space-y-4 p-5">
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
        <div class="sm:col-span-2 lg:col-span-4">
          <label for="task-search" class="field-label">Suche</label>
          <div class="relative">
            <AppIcon name="search" :size="18" class="pointer-events-none absolute left-3 top-1/2 mt-[3px] -translate-y-1/2 text-muted" />
            <input
              id="task-search"
              v-model="search"
              type="search"
              placeholder="Titel oder Notizen durchsuchen"
              class="field-input pl-10"
            />
          </div>
        </div>

        <div class="lg:col-span-3">
          <label for="task-match" class="field-label">Match</label>
          <select id="task-match" v-model="matchFilter" class="field-input">
            <option value="Alle">Alle Matches</option>
            <option v-for="match in sortedMatches" :key="match.id" :value="match.id">
              {{ match.homeTeam }} – {{ match.awayTeam }}
            </option>
          </select>
        </div>

        <div class="lg:col-span-2">
          <label for="task-category" class="field-label">Kategorie</label>
          <select id="task-category" v-model="category" class="field-input">
            <option value="Alle">Alle</option>
            <option v-for="item in TASK_CATEGORIES" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>

        <div class="lg:col-span-3">
          <label for="task-status" class="field-label">Status</label>
          <select id="task-status" v-model="status" class="field-input">
            <option value="Alle">Alle</option>
            <option v-for="item in TASK_STATUSES" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-4 border-t border-border pt-4 md:flex-row md:items-end md:justify-between">
        <div class="md:w-72">
          <label for="task-sort" class="field-label">Sortierung</label>
          <select id="task-sort" v-model="sortBy" class="field-input">
            <option v-for="option in SORT_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </div>

        <div role="group" aria-label="Ansicht wählen" class="inline-flex self-start rounded-xl border border-border bg-background p-1 md:self-auto">
          <button
            type="button"
            class="btn btn-sm"
            :class="view === 'list' ? 'bg-surface text-primary shadow-sm' : 'btn-ghost'"
            :aria-pressed="view === 'list'"
            @click="view = 'list'"
          >
            <AppIcon name="list" :size="16" />
            Liste
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="view === 'board' ? 'bg-surface text-primary shadow-sm' : 'btn-ghost'"
            :aria-pressed="view === 'board'"
            @click="view = 'board'"
          >
            <AppIcon name="board" :size="16" />
            Board
          </button>
        </div>
      </div>

      <!-- Aktive Filter -->
      <div class="flex flex-wrap items-center gap-2 text-sm" aria-live="polite">
        <span class="font-semibold text-primary">Aktiver Filter:</span>
        <template v-if="activeFilters.length">
          <button
            v-for="filter in activeFilters"
            :key="filter.key"
            type="button"
            class="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary hover:brightness-95"
            :aria-label="`${filter.label} entfernen`"
            @click="removeFilter(filter.key)"
          >
            {{ filter.label }}
            <AppIcon name="close" :size="14" />
          </button>
          <button type="button" class="text-xs font-semibold text-muted underline hover:text-primary" @click="resetFilters">
            Alle zurücksetzen
          </button>
        </template>
        <span v-else class="text-muted">keiner</span>
        <span class="ml-auto text-muted">{{ filteredTasks.length }} von {{ tasks.length }} Aufgaben</span>
      </div>
    </section>

    <!-- Inhalt -->
    <p v-if="loading && !tasks.length" class="card p-6 text-muted">Aufgaben werden geladen …</p>

    <section v-else-if="!tasks.length" class="card border-dashed p-10 text-center">
      <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
        <AppIcon name="tasks" />
      </span>
      <h3 class="mt-4 text-lg font-bold text-primary">Noch keine Aufgaben</h3>
      <p class="mx-auto mt-1 max-w-md text-sm text-muted">
        Lege die erste Content-Aufgabe an, zum Beispiel ein Matchplakat oder die Aufstellungsgrafik.
      </p>
      <button type="button" class="btn btn-primary mt-5" @click="creating = true">
        <AppIcon name="plus" :size="18" />
        Erste Aufgabe erstellen
      </button>
    </section>

    <section v-else-if="!filteredTasks.length" class="card border-dashed p-10 text-center">
      <h3 class="text-lg font-bold text-primary">Keine Aufgaben für diesen Filter</h3>
      <p class="mt-1 text-sm text-muted">Passe Suche, Match, Kategorie oder Status an.</p>
      <button type="button" class="btn btn-secondary mt-5" @click="resetFilters">Filter zurücksetzen</button>
    </section>

    <!-- Listenansicht -->
    <TransitionGroup v-else-if="view === 'list'" tag="section" name="list" class="grid gap-3 lg:grid-cols-2" aria-label="Aufgabenliste">
      <TaskCard
        v-for="task in filteredTasks"
        :key="task.id"
        :task="task"
        @status="changeStatus"
        @edit="editing = $event"
        @delete="deleting = $event"
      />
    </TransitionGroup>

    <!-- Board-Ansicht -->
    <section v-else aria-label="Aufgaben-Board" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      <div
        v-for="column in boardColumns"
        :key="column.name"
        class="flex flex-col rounded-2xl bg-zinc-100/80 p-3"
      >
        <div class="mb-3 flex items-center justify-between px-1">
          <StatusBadge :status="column.name" />
          <span class="text-sm font-bold text-secondary">{{ column.tasks.length }}</span>
        </div>

        <TransitionGroup tag="div" name="list" class="flex flex-1 flex-col gap-3">
          <TaskCard
            v-for="task in column.tasks"
            :key="task.id"
            :task="task"
            compact
            @status="changeStatus"
            @edit="editing = $event"
            @delete="deleting = $event"
          />
        </TransitionGroup>

        <p v-if="!column.tasks.length" class="rounded-xl border border-dashed border-zinc-300 p-4 text-center text-xs text-muted">
          Keine Aufgaben
        </p>
      </div>
    </section>

    <!-- Dialoge -->
    <AppModal
      :open="creating"
      title="Neue Aufgabe"
      description="Die Aufgabe wird in diesem Browser gespeichert."
      @close="creating = false"
    >
      <TaskForm v-if="creating" :match-id="null" @saved="onCreated" @cancel="creating = false" />
    </AppModal>

    <TaskDialogs v-model:edit-task="editing" v-model:delete-task="deleting" @notify="notify" />
  </div>
</template>
