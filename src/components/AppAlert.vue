<script setup>
import AppIcon from '@/components/AppIcon.vue'

defineProps({
  type: { type: String, default: 'info' },
  message: { type: String, required: true },
})

const styles = {
  info: { box: 'border-info/30 bg-info/10 text-blue-900', icon: 'info' },
  success: { box: 'border-success/30 bg-success/10 text-green-900', icon: 'check' },
  error: { box: 'border-error/30 bg-error/10 text-red-900', icon: 'alert' },
  warning: { box: 'border-warning/30 bg-warning/10 text-amber-900', icon: 'alert' },
}
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-xl border px-4 py-3 text-sm"
    :class="(styles[type] ?? styles.info).box"
    :role="type === 'error' ? 'alert' : 'status'"
    aria-live="polite"
  >
    <AppIcon :name="(styles[type] ?? styles.info).icon" :size="18" class="mt-0.5" />
    <p class="flex-1">{{ message }}</p>
    <slot />
  </div>
</template>
