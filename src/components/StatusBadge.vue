<script setup>
import { computed } from 'vue'

// Status wird immer mit Text UND Farbe dargestellt (nie nur Farbe).
const props = defineProps({
  status: { type: String, required: true },
  count: { type: Number, default: null },
})

const styles = {
  Offen: { badge: 'bg-zinc-100 text-secondary', dot: 'bg-muted' },
  'In Arbeit': { badge: 'bg-info/10 text-blue-800', dot: 'bg-info' },
  Geplant: { badge: 'bg-planned/10 text-violet-800', dot: 'bg-planned' },
  Erledigt: { badge: 'bg-success/10 text-green-800', dot: 'bg-success' },
  Überfällig: { badge: 'bg-error/10 text-red-800', dot: 'bg-error' },
}

const style = computed(() => styles[props.status] ?? styles.Offen)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="style.badge"
  >
    <span class="h-2 w-2 rounded-full" :class="style.dot" aria-hidden="true" />
    {{ status }}
    <span v-if="count !== null" class="font-bold">{{ count }}</span>
  </span>
</template>
