<script setup>
import { reactive, ref } from 'vue'
import AppAlert from '@/components/AppAlert.vue'

const stored = JSON.parse(localStorage.getItem('matchday-settings') || '{}')
const settings = reactive({
  clubName: stored.clubName || '',
  compactMode: Boolean(stored.compactMode),
  reminders: stored.reminders ?? true,
})

const saved = ref(false)

function save() {
  localStorage.setItem('matchday-settings', JSON.stringify(settings))
  saved.value = true
  setTimeout(() => (saved.value = false), 1800)
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <section>
      <p class="eyebrow">Personalisierung</p>
      <h2 class="page-title">Einstellungen</h2>
      <p class="mt-1 text-muted">Diese Einstellungen bleiben nur in diesem Browser gespeichert.</p>
    </section>

    <Transition name="fade">
      <AppAlert v-if="saved" type="success" message="Einstellungen wurden lokal gespeichert." />
    </Transition>

    <form class="card p-6" @submit.prevent="save">
      <label class="block">
        <span class="field-label">Vereinsname</span>
        <input v-model="settings.clubName" type="text" class="field-input" />
      </label>

      <label class="mt-5 flex items-start gap-3 rounded-xl bg-background p-4">
        <input v-model="settings.compactMode" type="checkbox" class="mt-1 h-4 w-4" />
        <span>
          <span class="block text-sm font-semibold text-primary">Kompakte Darstellung</span>
          <span class="mt-1 block text-sm text-muted">Merkt sich die Präferenz für spätere Erweiterungen.</span>
        </span>
      </label>

      <label class="mt-3 flex items-start gap-3 rounded-xl bg-background p-4">
        <input v-model="settings.reminders" type="checkbox" class="mt-1 h-4 w-4" />
        <span>
          <span class="block text-sm font-semibold text-primary">Erinnerungen vormerken</span>
          <span class="mt-1 block text-sm text-muted">Aktuell nur als lokale Einstellung gespeichert.</span>
        </span>
      </label>

      <button type="submit" class="btn btn-primary mt-6">
        Speichern
      </button>
    </form>
  </div>
</template>
