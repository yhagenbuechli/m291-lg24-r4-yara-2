<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  size: { type: String, default: 'md' }, // md | sm
})

const emit = defineEmits(['close'])

const titleId = useId()
const panel = ref(null)
let previousFocus = null

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      previousFocus = document.activeElement
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
      await nextTick()
      const firstField = panel.value?.querySelector('input, select, textarea, button:not([data-close])')
      ;(firstField ?? panel.value)?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
      previousFocus?.focus?.()
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-end justify-center bg-primary/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        @click.self="emit('close')"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          tabindex="-1"
          class="modal-panel max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-surface shadow-xl sm:rounded-2xl"
          :class="size === 'sm' ? 'sm:max-w-md' : 'sm:max-w-xl'"
        >
          <div class="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 :id="titleId" class="text-lg font-bold text-primary">{{ title }}</h2>
              <p v-if="description" class="mt-0.5 text-sm text-muted">{{ description }}</p>
            </div>
            <button type="button" data-close class="btn btn-ghost btn-icon" aria-label="Dialog schliessen" @click="emit('close')">
              <AppIcon name="close" />
            </button>
          </div>

          <div class="px-5 py-5 sm:px-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
