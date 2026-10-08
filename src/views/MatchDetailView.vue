<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import AppAlert from '@/components/AppAlert.vue'
import AppIcon from '@/components/AppIcon.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import TaskCard from '@/components/TaskCard.vue'
import TaskDialogs from '@/components/TaskDialogs.vue'
import TaskForm from '@/components/TaskForm.vue'
import { useMatchStore } from '@/stores/matchStore'
import { formatLongDate, sortTasks } from '@/utils/format'

const route = useRoute()
const store = useMatchStore()
const { loading, error } = storeToRefs(store)

const matchId = computed(() => Number(route.params.id))
const match = computed(() => store.getMatchById(matchId.value))
const tasks = computed(() => sortTasks(store.getTasksForMatch(matchId.value), 'publish'))
const progress = computed(() => store.getProgressForMatch(matchId.value))
const doneCount = computed(() => tasks.value.filter((task) => task.status === 'Erledigt').length)

const notice = ref('')
const actionError = ref('')
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
    <RouterLink to="/matches" class="btn btn-ghost btn-sm -ml-3">← Zurück zu den Matches</RouterLink>

    <AppAlert v-if="error" type="error" :message="error" />
    <AppAlert v-if="actionError" type="error" :message="actionError" />
    <Transition name="fade">
      <AppAlert v-if="notice" type="success" :message="notice" />
    </Transition>

    <p v-if="loading && !match" class="card p-6 text-muted">Match wird geladen …</p>

    <template v-else-if="match">
      <section class="relative overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg sm:p-8">
        <div class="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10" aria-hidden="true" />

        <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-sm font-semibold text-zinc-400">{{ match.competition || 'Matchday' }}</p>
            <h2 class="mt-2 text-2xl font-extrabold sm:text-3xl">
              {{ match.homeTeam }} <span class="text-zinc-500">vs.</span> {{ match.awayTeam }}
            </h2>
            <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-300">
              <span class="flex items-center gap-1.5"><AppIcon name="calendar" :size="16" />{{ formatLongDate(match.date) }}</span>
              <span class="flex items-center gap-1.5"><AppIcon name="clock" :size="16" />{{ match.time }} Uhr</span>
              <span class="flex items-center gap-1.5"><AppIcon name="ball" :size="16" />{{ match.stadium || 'Stadion offen' }}</span>
            </div>
          </div>

          <div class="w-full rounded-xl bg-white/10 p-4 lg:w-80">
            <ProgressBar :value="progress" label="Match-Fortschritt" inverted />
            <p class="mt-2 text-xs text-zinc-400">{{ doneCount }} von {{ tasks.length }} Aufgaben erledigt</p>
          </div>
        </div>
      </section>

      <section class="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div class="space-y-4">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 class="text-lg font-bold text-primary">Content-Aufgaben</h3>
              <p class="text-sm text-muted">{{ tasks.length }} {{ tasks.length === 1 ? 'Aufgabe' : 'Aufgaben' }}, sortiert nach Veröffentlichung.</p>
            </div>
            <RouterLink :to="`/tasks?match=${match.id}`" class="btn btn-ghost btn-sm">
              Im Aufgaben-Board öffnen
              <AppIcon name="arrow" :size="16" />
            </RouterLink>
          </div>

          <TransitionGroup v-if="tasks.length" tag="div" name="list" class="grid gap-3 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <TaskCard
              v-for="task in tasks"
              :key="task.id"
              :task="task"
              :show-match="false"
              @status="changeStatus"
              @edit="editing = $event"
              @delete="deleting = $event"
            />
          </TransitionGroup>

          <div v-else class="card border-dashed p-8 text-center">
            <p class="font-semibold text-primary">Noch keine Aufgaben</p>
            <p class="mt-1 text-sm text-muted">Lege mit dem Formular die erste Content-Aufgabe an.</p>
          </div>
        </div>

        <aside class="card h-fit p-6 xl:sticky xl:top-24">
          <h3 class="text-lg font-bold text-primary">Aufgabe hinzufügen</h3>
          <p class="mb-4 mt-1 text-sm text-muted">Wird in diesem Browser gespeichert.</p>
          <TaskForm
            :key="match.id"
            :match-id="match.id"
            :show-cancel="false"
            @saved="notify('success', 'Aufgabe wurde gespeichert.')"
          />
        </aside>
      </section>
    </template>

    <section v-else class="card border-dashed p-10 text-center">
      <h2 class="text-xl font-bold text-primary">Match nicht gefunden</h2>
      <p class="mt-1 text-sm text-muted">Vielleicht wurde es gelöscht oder der Link ist falsch.</p>
      <RouterLink to="/matches" class="btn btn-dark mt-5">Zur Matchübersicht</RouterLink>
    </section>

    <TaskDialogs v-model:edit-task="editing" v-model:delete-task="deleting" @notify="notify" />
  </div>
</template>
