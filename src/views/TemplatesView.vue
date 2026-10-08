<script setup>
import { onMounted, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppAlert from '@/components/AppAlert.vue'
import { useMatchStore } from '@/stores/matchStore'

const store = useMatchStore()
const { templates, loading, error } = storeToRefs(store)

const form = reactive({ name: '', description: '' })
const formError = ref('')
const submitError = ref('')
const success = ref('')
const saving = ref(false)

onMounted(() => store.loadAll())

async function submit() {
  formError.value = ''
  submitError.value = ''
  success.value = ''

  if (!form.name.trim()) {
    formError.value = 'Bitte gib einen Namen für die Vorlage ein.'
    return
  }

  saving.value = true
  try {
    await store.createTemplate(form)
    success.value = 'Vorlage wurde gespeichert.'
    form.name = ''
    form.description = ''
  } catch (err) {
    submitError.value = err.message || 'Vorlage konnte nicht gespeichert werden.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <section>
      <p class="eyebrow">Wiederverwenden</p>
      <h2 class="page-title">Vorlagen</h2>
      <p class="mt-1 text-muted">Speichere wiederkehrende Content-Pakete für Matchdays.</p>
    </section>

    <AppAlert v-if="error" type="error" :message="error" />

    <section class="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <form class="card p-6" novalidate @submit.prevent="submit">
        <h3 class="text-lg font-bold text-primary">Neue Vorlage</h3>

        <Transition name="fade">
          <AppAlert v-if="success" class="mt-4" type="success" :message="success" />
        </Transition>
        <AppAlert v-if="submitError" class="mt-4" type="error" :message="submitError" />

        <label class="mt-5 block">
          <span class="field-label">Name *</span>
          <input
            v-model="form.name"
            type="text"
            class="field-input"
            :aria-invalid="Boolean(formError)"
          />
          <span v-if="formError" class="field-error">{{ formError }}</span>
        </label>

        <label class="mt-4 block">
          <span class="field-label">Beschreibung</span>
          <textarea v-model="form.description" rows="5" class="field-input" />
        </label>

        <button type="submit" :disabled="saving" class="btn btn-primary mt-5 w-full">
          {{ saving ? 'Speichert …' : 'Vorlage speichern' }}
        </button>
      </form>

      <div>
        <p v-if="loading && !templates.length" class="card p-6 text-muted">
          Vorlagen werden geladen …
        </p>

        <div v-else-if="templates.length" class="grid gap-4 sm:grid-cols-2">
          <article
            v-for="template in templates"
            :key="template.id"
            class="card p-5"
          >
            <p class="text-xs font-semibold uppercase tracking-wider text-muted">Content-Vorlage</p>
            <h3 class="mt-2 text-lg font-bold text-primary">{{ template.name }}</h3>
            <p class="mt-2 text-sm leading-6 text-zinc-600">{{ template.description || 'Keine Beschreibung.' }}</p>
          </article>
        </div>

        <p v-else class="card border-dashed p-10 text-center text-muted">
          Noch keine Vorlagen gespeichert.
        </p>
      </div>
    </section>
  </div>
</template>