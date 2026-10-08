<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppIcon from '@/components/AppIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import { useMatchStore } from '@/stores/matchStore'

const store = useMatchStore()
const { tasks } = storeToRefs(store)
onMounted(() => store.loadAll())

const mediaItems = computed(() =>
  tasks.value
    .filter((task) => ['Grafik', 'Foto', 'Video'].includes(task.category))
    .slice(0, 12),
)
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section>
      <p class="eyebrow">Assets</p>
      <h2 class="page-title">Mediathek</h2>
      <p class="mt-1 text-muted">Produktionsübersicht für Grafik-, Foto- und Videoaufgaben.</p>
    </section>

    <section v-if="mediaItems.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="item in mediaItems"
        :key="item.id"
        class="card overflow-hidden"
      >
        <div class="flex aspect-video items-center justify-center bg-primary text-accent">
          <AppIcon :name="item.category === 'Video' ? 'video' : 'image'" :size="48" />
        </div>
        <div class="p-5">
          <div class="flex items-center justify-between gap-3">
            <p class="eyebrow">{{ item.category }}</p>
            <StatusBadge :status="item.status" />
          </div>
          <h3 class="mt-2 font-bold text-primary">{{ item.title }}</h3>
          <p class="mt-1 truncate text-sm text-muted">{{ store.getMatchLabel(item.matchId) }}</p>
        </div>
      </article>
    </section>

    <section v-else class="card border-dashed p-10 text-center">
      <h3 class="font-bold text-primary">Noch keine Medienaufgaben</h3>
      <p class="mt-2 text-sm text-muted">Grafik-, Foto- und Videoaufgaben erscheinen hier automatisch.</p>
    </section>
  </div>
</template>
