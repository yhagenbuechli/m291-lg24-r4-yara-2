<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppAlert from '@/components/AppAlert.vue'
import AppIcon from '@/components/AppIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import { useMatchStore } from '@/stores/matchStore'
import { formatLongDate } from '@/utils/format'

const store = useMatchStore()
const { matches, loading, error } = storeToRefs(store)

onMounted(() => store.loadAll())

const tab = ref('upcoming')

function startOf(match) {
  return new Date(`${match.date}T${match.time || '23:59'}`)
}

const upcoming = computed(() =>
  matches.value.filter((match) => startOf(match) >= new Date()).sort((a, b) => startOf(a) - startOf(b)),
)
const past = computed(() =>
  matches.value.filter((match) => startOf(match) < new Date()).sort((a, b) => startOf(b) - startOf(a)),
)
const visible = computed(() => (tab.value === 'upcoming' ? upcoming.value : past.value))

function taskCount(id) {
  return store.getTasksForMatch(id).length
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="eyebrow">Planung</p>
        <h2 class="page-title">Matches</h2>
        <p class="mt-1 text-muted">Alle Matchdays mit ihrem Content-Fortschritt.</p>
      </div>

      <RouterLink to="/matches/new" class="btn btn-primary">
        <AppIcon name="plus" :size="18" />
        Match erstellen
      </RouterLink>
    </section>

    <AppAlert v-if="error" type="error" :message="error" />

    <div role="group" aria-label="Matches anzeigen" class="inline-flex rounded-xl border border-border bg-surface p-1">
      <button
        type="button"
        class="btn btn-sm"
        :class="tab === 'upcoming' ? 'bg-primary text-surface' : 'btn-ghost'"
        :aria-pressed="tab === 'upcoming'"
        @click="tab = 'upcoming'"
      >
        Kommend ({{ upcoming.length }})
      </button>
      <button
        type="button"
        class="btn btn-sm"
        :class="tab === 'past' ? 'bg-primary text-surface' : 'btn-ghost'"
        :aria-pressed="tab === 'past'"
        @click="tab = 'past'"
      >
        Vergangen ({{ past.length }})
      </button>
    </div>

    <p v-if="loading && !matches.length" class="card p-6 text-muted">Matches werden geladen …</p>

    <TransitionGroup v-else-if="visible.length" tag="section" name="list" class="grid gap-4 lg:grid-cols-2">
      <RouterLink
        v-for="match in visible"
        :key="match.id"
        :to="`/matches/${match.id}`"
        class="card group block p-6 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <p class="eyebrow">{{ match.competition || 'Matchday' }}</p>
          <span class="rounded-full bg-background px-3 py-1 text-xs font-semibold text-secondary">
            {{ taskCount(match.id) }} {{ taskCount(match.id) === 1 ? 'Aufgabe' : 'Aufgaben' }}
          </span>
        </div>

        <h3 class="mt-2 text-xl font-bold text-primary">
          {{ match.homeTeam }} <span class="font-semibold text-muted">vs.</span> {{ match.awayTeam }}
        </h3>

        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
          <span class="flex items-center gap-1.5"><AppIcon name="calendar" :size="16" />{{ formatLongDate(match.date) }}</span>
          <span class="flex items-center gap-1.5"><AppIcon name="clock" :size="16" />{{ match.time }} Uhr</span>
          <span class="flex items-center gap-1.5"><AppIcon name="ball" :size="16" />{{ match.stadium || 'Stadion offen' }}</span>
        </div>

        <div class="mt-5">
          <ProgressBar :value="store.getProgressForMatch(match.id)" label="Aufgabenfortschritt" />
        </div>
      </RouterLink>
    </TransitionGroup>

    <section v-else class="card border-dashed p-10 text-center">
      <h3 class="text-xl font-bold text-primary">
        {{ tab === 'upcoming' ? 'Keine kommenden Matches' : 'Noch keine vergangenen Matches' }}
      </h3>
      <p class="mt-2 text-sm text-muted">Erstelle ein Match oder importiere eines aus OpenLigaDB.</p>
      <RouterLink to="/matches/new" class="btn btn-primary mt-5">Match erstellen</RouterLink>
    </section>
  </div>
</template>
