<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppAlert from '@/components/AppAlert.vue'
import AppIcon from '@/components/AppIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useMatchStore } from '@/stores/matchStore'
import { formatDate, formatDateTime, formatLongDate, isPublishTimePassed, sortTasks } from '@/utils/format'

const store = useMatchStore()
const { nextMatch, openTasks, completedCount, totalTaskCount, progress, loading, error, matches, tasks } =
  storeToRefs(store)

onMounted(() => store.loadAll())

const statistics = computed(() => [
  { label: 'Matches', value: matches.value.length, icon: 'calendar' },
  { label: 'Aufgaben', value: tasks.value.length, icon: 'tasks' },
  { label: 'Erledigt', value: tasks.value.filter((task) => task.status === 'Erledigt').length, icon: 'check' },
  { label: 'Offen', value: tasks.value.filter((task) => task.status !== 'Erledigt').length, icon: 'clock' },
])

const nextOpenTasks = computed(() => sortTasks(openTasks.value, 'publish').slice(0, 5))

const upcomingMatches = computed(() => {
  const now = new Date()
  return [...matches.value]
    .filter((match) => match.id !== nextMatch.value?.id && new Date(`${match.date}T${match.time || '23:59'}`) >= now)
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
    .slice(0, 3)
})

const countdown = computed(() => {
  if (!nextMatch.value) return ''
  const start = new Date(`${nextMatch.value.date}T${nextMatch.value.time || '00:00'}`)
  const days = Math.ceil((start - new Date()) / 86_400_000)
  if (days < 0) return 'Bereits gespielt'
  if (days === 0) return 'Heute'
  if (days === 1) return 'Morgen'
  return `In ${days} Tagen`
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section>
      <p class="eyebrow">Übersicht</p>
      <h2 class="page-title sm:text-4xl">Hallo Yara</h2>
      <p class="mt-1 text-muted">Hier siehst du den aktuellen Stand für den nächsten Matchday.</p>
    </section>

    <Transition name="fade">
      <AppAlert v-if="error" type="error" :message="error" />
    </Transition>

    <section v-if="loading && !matches.length" class="card p-8 text-center">
      <p class="font-semibold text-primary">Daten werden geladen …</p>
      <p class="mt-1 text-sm text-muted">Matches, Aufgaben und Vorlagen werden geladen.</p>
    </section>

    <template v-else-if="nextMatch">
      <!-- Nächstes Match -->
      <section class="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg sm:p-8">
        <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10" aria-hidden="true" />
        <div class="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-accent/5" aria-hidden="true" />

        <div class="relative">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span class="text-sm font-medium text-zinc-300">{{ nextMatch.competition || 'Matchday' }}</span>
            <span class="rounded-lg bg-accent px-3 py-1.5 text-xs font-bold text-primary">
              Nächstes Match · {{ countdown }}
            </span>
          </div>

          <div class="mt-6 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p class="flex flex-wrap items-center gap-x-3 gap-y-2 text-2xl font-extrabold sm:text-3xl">
                <span>{{ nextMatch.homeTeam }}</span>
                <span class="text-sm font-bold uppercase tracking-widest text-zinc-500">vs.</span>
                <span>{{ nextMatch.awayTeam }}</span>
              </p>

              <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-300">
                <div class="flex items-center gap-2">
                  <span class="sr-only">Datum:</span>
                  <AppIcon name="calendar" :size="16" />
                  <span>{{ formatLongDate(nextMatch.date) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="sr-only">Anspielzeit:</span>
                  <AppIcon name="clock" :size="16" />
                  <span>{{ nextMatch.time }} Uhr</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="sr-only">Stadion:</span>
                  <AppIcon name="ball" :size="16" />
                  <span>{{ nextMatch.stadium || 'Stadion noch offen' }}</span>
                </div>
              </div>
            </div>

            <RouterLink :to="`/matches/${nextMatch.id}`" class="btn btn-primary">
              Match öffnen
              <AppIcon name="arrow" :size="16" />
            </RouterLink>
          </div>

          <div class="mt-8 max-w-xl">
            <ProgressBar :value="progress" inverted />
            <p class="mt-2 text-sm text-zinc-400">{{ completedCount }} von {{ totalTaskCount }} Aufgaben erledigt</p>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-3">
        <!-- Offene Aufgaben -->
        <article class="card p-6 xl:col-span-2">
          <div class="mb-5 flex items-start justify-between gap-4">
            <div>
              <h3 class="text-lg font-bold text-primary">Offene Aufgaben</h3>
              <p class="mt-1 text-sm text-muted">Die nächsten Content-Aufgaben für dieses Match.</p>
            </div>
            <RouterLink :to="`/tasks?match=${nextMatch.id}`" class="btn btn-ghost btn-sm">
              Alle anzeigen
              <AppIcon name="arrow" :size="16" />
            </RouterLink>
          </div>

          <ul v-if="nextOpenTasks.length" class="divide-y divide-border">
            <li
              v-for="task in nextOpenTasks"
              :key="task.id"
              class="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div class="min-w-0">
                <p class="font-semibold text-primary">{{ task.title }}</p>
                <p class="mt-0.5 text-sm text-muted">
                  {{ task.category }}
                  <span v-if="task.publishTime" :class="isPublishTimePassed(task) ? 'font-semibold text-amber-700' : ''">
                    · {{ formatDateTime(task.publishTime) }}
                  </span>
                </p>
              </div>
              <StatusBadge :status="task.status" class="self-start sm:self-auto" />
            </li>
          </ul>

          <div v-else class="rounded-xl bg-background p-5 text-center">
            <p class="font-semibold text-primary">Keine offenen Aufgaben</p>
            <p class="mt-1 text-sm text-muted">
              {{ totalTaskCount ? 'Für dieses Match ist alles erledigt.' : 'Für dieses Match gibt es noch keine Aufgaben.' }}
            </p>
            <RouterLink :to="`/matches/${nextMatch.id}`" class="btn btn-secondary btn-sm mt-4">
              <AppIcon name="plus" :size="16" />
              Aufgabe hinzufügen
            </RouterLink>
          </div>
        </article>

        <!-- Schnellzugriff + weitere Matches -->
        <div class="space-y-6">
          <article class="card p-6">
            <h3 class="text-lg font-bold text-primary">Schnellzugriff</h3>
            <div class="mt-4 grid gap-2">
              <RouterLink to="/matches/new" class="btn btn-primary">
                <AppIcon name="plus" :size="18" />
                Neues Match
              </RouterLink>
              <RouterLink :to="`/matches/${nextMatch.id}`" class="btn btn-secondary">
                <AppIcon name="tasks" :size="18" />
                Aufgabe hinzufügen
              </RouterLink>
              <RouterLink to="/templates" class="btn btn-secondary">
                <AppIcon name="layers" :size="18" />
                Vorlagen
              </RouterLink>
            </div>
          </article>

          <article v-if="upcomingMatches.length" class="card p-6">
            <h3 class="text-lg font-bold text-primary">Danach</h3>
            <ul class="mt-3 space-y-2">
              <li v-for="match in upcomingMatches" :key="match.id">
                <RouterLink
                  :to="`/matches/${match.id}`"
                  class="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition hover:bg-background"
                >
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-primary">
                      {{ match.homeTeam }} – {{ match.awayTeam }}
                    </span>
                    <span class="block text-xs text-muted">{{ formatDate(match.date) }} · {{ match.time }} Uhr</span>
                  </span>
                  <span class="text-sm font-bold text-primary">{{ store.getProgressForMatch(match.id) }} %</span>
                </RouterLink>
              </li>
            </ul>
          </article>
        </div>
      </section>
    </template>

    <section v-else class="card border-dashed p-10 text-center">
      <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
        <AppIcon name="calendar" />
      </span>
      <h3 class="mt-4 text-xl font-bold text-primary">Noch kein Match geplant</h3>
      <p class="mx-auto mt-2 max-w-xl text-sm text-muted">
        Erstelle ein Match manuell oder übernimm aktuelle Spieldaten aus OpenLigaDB.
      </p>
      <RouterLink to="/matches/new" class="btn btn-primary mt-5">Erstes Match erstellen</RouterLink>
    </section>

    <!-- Statistik -->
    <section aria-labelledby="stats-title">
      <h3 id="stats-title" class="mb-3 text-lg font-bold text-primary">Projekt-Statistik</h3>
      <div class="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <article v-for="statistic in statistics" :key="statistic.label" class="card flex items-center gap-4 p-5">
          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-secondary">
            <AppIcon :name="statistic.icon" :size="20" />
          </span>
          <div>
            <p class="text-sm text-muted">{{ statistic.label }}</p>
            <p class="text-2xl font-bold text-primary">{{ statistic.value }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
