<script setup>
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { footerNavigation, mainNavigation } from '@/router/navigation'

const route = useRoute()
const moreOpen = ref(false)

const primaryItems = mainNavigation.slice(0, 3)
const moreItems = [...mainNavigation.slice(3), ...footerNavigation]

function isActive(to) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const moreActive = computed(() => moreItems.some((item) => isActive(item.to)))

// Menü schliessen, sobald eine Seite gewählt wurde
watch(() => route.fullPath, () => (moreOpen.value = false))
</script>

<template>
  <div class="md:hidden">
    <Transition name="fade">
      <div v-if="moreOpen" class="fixed inset-0 z-30 bg-primary/40" aria-hidden="true" @click="moreOpen = false" />
    </Transition>

    <Transition name="fade">
      <nav
        v-if="moreOpen"
        id="mobile-more-menu"
        aria-label="Weitere Seiten"
        class="fixed inset-x-3 bottom-20 z-40 rounded-2xl border border-border bg-surface p-2 shadow-xl"
      >
        <RouterLink
          v-for="item in moreItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
          :class="isActive(item.to) ? 'bg-accent text-primary' : 'text-secondary hover:bg-background'"
        >
          <AppIcon :name="item.icon" :size="18" />
          {{ item.label }}
        </RouterLink>
      </nav>
    </Transition>

    <nav
      aria-label="Mobile Navigation"
      class="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <RouterLink
        v-for="item in primaryItems"
        :key="item.to"
        :to="item.to"
        class="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold"
        :class="isActive(item.to) ? 'text-primary' : 'text-muted'"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <span
          class="flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200"
          :class="isActive(item.to) ? 'bg-accent' : ''"
        >
          <AppIcon :name="item.icon" :size="18" />
        </span>
        {{ item.label }}
      </RouterLink>

      <button
        type="button"
        class="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold"
        :class="moreOpen || moreActive ? 'text-primary' : 'text-muted'"
        :aria-expanded="moreOpen"
        aria-controls="mobile-more-menu"
        @click="moreOpen = !moreOpen"
      >
        <span
          class="flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-200"
          :class="moreOpen || moreActive ? 'bg-accent' : ''"
        >
          <AppIcon :name="moreOpen ? 'close' : 'menu'" :size="18" />
        </span>
        Mehr
      </button>
    </nav>
  </div>
</template>
