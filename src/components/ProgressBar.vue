<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true },
  label: { type: String, default: 'Content-Fortschritt' },
  inverted: { type: Boolean, default: false }, // für dunkle Hintergründe
})

const clamped = computed(() => Math.max(0, Math.min(100, Math.round(props.value))))
</script>

<template>
  <div>
    <div class="mb-2 flex items-center justify-between gap-4">
      <p class="text-sm font-semibold" :class="inverted ? 'text-zinc-300' : 'text-primary'">{{ label }}</p>
      <span class="text-lg font-bold" :class="inverted ? 'text-white' : 'text-primary'">{{ clamped }} %</span>
    </div>

    <div
      class="h-2.5 w-full overflow-hidden rounded-full"
      :class="inverted ? 'bg-white/15' : 'bg-zinc-200'"
      role="progressbar"
      :aria-label="label"
      :aria-valuenow="clamped"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="h-full rounded-full bg-accent transition-[width] duration-300" :style="{ width: `${clamped}%` }" />
    </div>
  </div>
</template>
