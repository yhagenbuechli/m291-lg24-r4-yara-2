<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const route = useRoute()
const title = computed(() => route.meta.title ?? 'Matchday Content Planner')

const today = new Intl.DateTimeFormat('de-CH', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date())
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
    <div class="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div class="min-w-0">
        <p class="truncate text-xs font-medium text-muted">
          <span class="md:hidden">Matchday Content Planner · </span>{{ today }}
        </p>
        <h1 class="truncate text-lg font-bold text-primary">{{ title }}</h1>
      </div>

      <div class="flex items-center gap-3">
        <RouterLink v-if="route.path !== '/matches/new'" to="/matches/new" class="btn btn-dark btn-sm hidden sm:inline-flex">
          <AppIcon name="plus" :size="16" />
          Neues Match
        </RouterLink>

        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-accent"
          role="img"
          aria-label="Angemeldet als Yara"
        >
          Y
        </div>
      </div>
    </div>
  </header>
</template>
