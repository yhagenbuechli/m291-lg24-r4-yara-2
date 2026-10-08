<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '@/components/AppIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useMatchStore } from '@/stores/matchStore'
import { calculateProgress, TASK_CATEGORIES, TASK_STATUSES } from '@/utils/validation'

const store = useMatchStore()
const { matches, tasks } = storeToRefs(store)

onMounted(() => store.loadAll())

const done = computed(() => tasks.value.filter((task) => task.status === 'Erledigt').length)
const overallProgress = computed(() => calculateProgress(tasks.value))

function share(count) {
  return tasks.value.length ? Math.round((count / tasks.value.length) * 100) : 0
}

const statusStats = computed(() =>
  TASK_STATUSES.map((status) => {
    const count = tasks.value.filter((task) => task.status === status).length
    return { status, count, share: share(count) }
  }),
)

const categoryStats = computed(() =>
  TASK_CATEGORIES.map((category) => {
    const count = tasks.value.filter((task) => task.category === category).length
    return { category, count, share: share(count) }
  }).filter((item) => item.count > 0),
)

const matchStats = computed(() =>
  [...matches.value]
    .map((match) => ({
      match,
      total: store.getTasksForMatch(match.id).length,
      progress: store.getProgressForMatch(match.id),
    }))
    .sort((a, b) => `${a.match.date}${a.match.time}`.localeCompare(`${b.match.date}${b.match.time}`)),
)

const kpis = computed(() => [
  { label: 'Matches', value: matches.value.length, icon: 'calendar' },
  { label: 'Aufgaben', value: tasks.value.length, icon: 'tasks' },
  { label: 'Erledigt', value: done.value, icon: 'check' },
  { label: 'Fortschritt', value: `${overallProgress.value} %`, icon: 'chart' },
])
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section>
      <p class="eyebrow">Auswertung</p>
      <h2 class="page-title">Statistiken</h2>
      <p class="mt-1 text-muted">Ein schneller Überblick über die Content-Produktion.</p>
    </section>

    <section class="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <article v-for="kpi in kpis" :key="kpi.label" class="card flex items-center gap-4 p-5">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-secondary">
          <AppIcon :name="kpi.icon" />
        </span>
        <div>
          <p class="text-sm text-muted">{{ kpi.label }}</p>
          <p class="text-2xl font-bold text-primary">{{ kpi.value }}</p>
        </div>
      </article>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
      <article class="card p-6">
        <h3 class="text-lg font-bold text-primary">Aufgaben nach Status</h3>
        <ul v-if="tasks.length" class="mt-5 space-y-4">
          <li v-for="item in statusStats" :key="item.status">
            <div class="flex items-center justify-between gap-3">
              <StatusBadge :status="item.status" />
              <span class="text-sm font-semibold text-primary">{{ item.count }} · {{ item.share }} %</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
              <div class="h-full rounded-full bg-primary transition-[width] duration-300" :style="{ width: `${item.share}%` }" />
            </div>
          </li>
        </ul>
        <p v-else class="mt-5 text-sm text-muted">Noch keine Daten für eine Auswertung.</p>
      </article>

      <article class="card p-6">
        <h3 class="text-lg font-bold text-primary">Aufgaben nach Kategorie</h3>
        <ul v-if="categoryStats.length" class="mt-5 space-y-4">
          <li v-for="item in categoryStats" :key="item.category">
            <div class="flex items-center justify-between gap-3 text-sm">
              <span class="font-semibold text-primary">{{ item.category }}</span>
              <span class="font-semibold text-secondary">{{ item.count }} · {{ item.share }} %</span>
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
              <div class="h-full rounded-full bg-accent transition-[width] duration-300" :style="{ width: `${item.share}%` }" />
            </div>
          </li>
        </ul>
        <p v-else class="mt-5 text-sm text-muted">Noch keine Daten für eine Auswertung.</p>
      </article>
    </section>

    <section class="card p-6">
      <h3 class="text-lg font-bold text-primary">Fortschritt pro Match</h3>
      <ul v-if="matchStats.length" class="mt-5 divide-y divide-border">
        <li v-for="item in matchStats" :key="item.match.id" class="py-4 first:pt-0 last:pb-0">
          <RouterLink :to="`/matches/${item.match.id}`" class="block rounded-lg hover:bg-background">
            <ProgressBar
              :value="item.progress"
              :label="`${item.match.homeTeam} – ${item.match.awayTeam} (${item.total} ${item.total === 1 ? 'Aufgabe' : 'Aufgaben'})`"
            />
          </RouterLink>
        </li>
      </ul>
      <p v-else class="mt-5 text-sm text-muted">Noch keine Matches erfasst.</p>
    </section>
  </div>
</template>
