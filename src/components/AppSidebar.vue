<script setup>
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { footerNavigation, mainNavigation } from '@/router/navigation'

// "/" soll nur exakt aktiv sein, alle anderen Einträge auch auf Unterseiten (z. B. /matches/3)
function linkClass(isActive) {
  return isActive
    ? 'bg-accent text-primary'
    : 'text-zinc-300 hover:bg-secondary hover:text-white'
}
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-primary px-4 py-6 text-white md:flex">
    <RouterLink to="/" class="mb-8 flex items-center gap-3 rounded-lg px-2 py-1">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary">
        <AppIcon name="ball" :size="22" />
      </span>
      <span>
        <span class="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">Matchday</span>
        <span class="block text-lg font-bold leading-tight">Content Planner</span>
      </span>
    </RouterLink>

    <nav aria-label="Hauptnavigation" class="flex flex-1 flex-col gap-1">
      <RouterLink
        v-for="item in mainNavigation"
        :key="item.to"
        v-slot="{ href, navigate, isActive, isExactActive }"
        :to="item.to"
        custom
      >
        <a
          :href="href"
          class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200"
          :class="linkClass(item.to === '/' ? isExactActive : isActive)"
          :aria-current="(item.to === '/' ? isExactActive : isActive) ? 'page' : undefined"
          @click="navigate"
        >
          <AppIcon :name="item.icon" :size="18" />
          {{ item.label }}
        </a>
      </RouterLink>
    </nav>

    <RouterLink
      v-for="item in footerNavigation"
      :key="item.to"
      v-slot="{ href, navigate, isActive }"
      :to="item.to"
      custom
    >
      <a
        :href="href"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200"
        :class="isActive ? 'bg-accent text-primary' : 'text-zinc-400 hover:bg-secondary hover:text-white'"
        :aria-current="isActive ? 'page' : undefined"
        @click="navigate"
      >
        <AppIcon :name="item.icon" :size="18" />
        {{ item.label }}
      </a>
    </RouterLink>
  </aside>
</template>
