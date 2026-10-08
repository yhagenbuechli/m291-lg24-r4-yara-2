<script setup>
import { computed, useId } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useMatchStore } from '@/stores/matchStore'
import { formatDateTime, isPublishTimePassed } from '@/utils/format'
import { TASK_STATUSES } from '@/utils/validation'

const props = defineProps({
  task: { type: Object, required: true },
  showMatch: { type: Boolean, default: true },
  compact: { type: Boolean, default: false }, // für die Board-Spalten
})

const emit = defineEmits(['status', 'edit', 'delete'])

const store = useMatchStore()
const uid = useId()

const matchLabel = computed(() => store.getMatchLabel(props.task.matchId))
const timePassed = computed(() => isPublishTimePassed(props.task))
const isDone = computed(() => props.task.status === 'Erledigt')
</script>

<template>
  <article
    class="card group p-4 transition hover:border-zinc-300 hover:shadow-md"
    :class="[compact ? 'sm:p-4' : 'sm:p-5', isDone ? 'bg-zinc-50/80' : '']"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="eyebrow">{{ task.category }}</p>
        <h3 class="mt-1 break-words font-bold text-primary" :class="isDone ? 'text-muted line-through' : ''">
          {{ task.title }}
        </h3>
      </div>
      <StatusBadge v-if="!compact" :status="task.status" />
    </div>

    <div class="mt-3 space-y-1.5 text-sm text-muted">
      <div v-if="showMatch" class="flex items-center gap-2">
        <span class="sr-only">Match:</span>
        <AppIcon name="ball" :size="16" />
        <span class="truncate">
          <RouterLink :to="`/matches/${task.matchId}`" class="hover:text-primary hover:underline">
            {{ matchLabel }}
          </RouterLink>
        </span>
      </div>

      <div v-if="task.publishTime" class="flex items-center gap-2" :class="timePassed ? 'font-semibold text-amber-700' : ''">
        <span class="sr-only">Veröffentlichung:</span>
        <AppIcon :name="timePassed ? 'alert' : 'clock'" :size="16" />
        <span>
          {{ formatDateTime(task.publishTime) }}
          <span v-if="timePassed"> · Termin überschritten</span>
        </span>
      </div>
    </div>

    <p v-if="task.notes && !compact" class="mt-3 line-clamp-3 whitespace-pre-line text-sm text-secondary">
      {{ task.notes }}
    </p>

    <div class="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-border pt-3">
      <div class="min-w-0 flex-1 sm:max-w-56">
        <label :for="`${uid}-status`" class="text-xs font-semibold text-muted">Status</label>
        <select
          :id="`${uid}-status`"
          :value="task.status"
          class="field-input mt-1 min-h-9 py-1.5 text-sm"
          :aria-label="`Status von «${task.title}» ändern`"
          @change="emit('status', task, $event.target.value)"
        >
          <option v-for="status in TASK_STATUSES" :key="status" :value="status">{{ status }}</option>
        </select>
      </div>

      <div class="flex gap-1">
        <button
          type="button"
          class="btn btn-ghost btn-icon"
          :aria-label="`«${task.title}» bearbeiten`"
          title="Bearbeiten"
          @click="emit('edit', task)"
        >
          <AppIcon name="edit" :size="18" />
        </button>
        <button
          type="button"
          class="btn btn-ghost btn-icon hover:bg-error/10 hover:text-red-700"
          :aria-label="`«${task.title}» löschen`"
          title="Löschen"
          @click="emit('delete', task)"
        >
          <AppIcon name="trash" :size="18" />
        </button>
      </div>
    </div>
  </article>
</template>
