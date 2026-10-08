<script setup>
import { computed, reactive, ref, useId } from 'vue'
import { storeToRefs } from 'pinia'
import AppAlert from '@/components/AppAlert.vue'
import { useMatchStore } from '@/stores/matchStore'
import { TASK_CATEGORIES, TASK_STATUSES, validateTask } from '@/utils/validation'

// Formular zum Erstellen (ohne `task`) oder Bearbeiten (mit `task`) einer Aufgabe.
// Ist `matchId` gesetzt, ist das Match fix; sonst kann es ausgewählt werden.
const props = defineProps({
  matchId: { type: Number, default: null },
  task: { type: Object, default: null },
  showCancel: { type: Boolean, default: true },
})

const emit = defineEmits(['saved', 'cancel'])

const store = useMatchStore()
const { matches } = storeToRefs(store)
const uid = useId()

const isEdit = computed(() => Boolean(props.task))
const showMatchSelect = computed(() => isEdit.value || !props.matchId)

const sortedMatches = computed(() =>
  [...matches.value].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
)

function emptyForm() {
  return {
    matchId: props.task?.matchId ?? props.matchId ?? '',
    title: props.task?.title ?? '',
    category: props.task?.category ?? TASK_CATEGORIES[0],
    status: props.task?.status ?? TASK_STATUSES[0],
    publishTime: props.task?.publishTime ?? '',
    notes: props.task?.notes ?? '',
  }
}

const form = reactive(emptyForm())
const errors = ref({})
const saving = ref(false)
const submitError = ref('')

function validateField(field) {
  const all = validateTask(form)
  errors.value = { ...errors.value, [field]: all[field] }
}

async function submit() {
  errors.value = validateTask(form)
  if (Object.values(errors.value).some(Boolean)) return

  saving.value = true
  submitError.value = ''

  try {
    const saved = isEdit.value
      ? await store.updateTask(props.task.id, form)
      : await store.createTask(form)
    emit('saved', saved)
    if (!isEdit.value) {
      Object.assign(form, emptyForm())
      errors.value = {}
    }
  } catch (err) {
    submitError.value = err.message || 'Aufgabe konnte nicht gespeichert werden.'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" novalidate @submit.prevent="submit">
    <AppAlert v-if="submitError" type="error" :message="submitError" />

    <div v-if="showMatchSelect">
      <label :for="`${uid}-match`" class="field-label">Match *</label>
      <select
        :id="`${uid}-match`"
        v-model="form.matchId"
        class="field-input"
        :aria-invalid="Boolean(errors.matchId)"
        :aria-describedby="errors.matchId ? `${uid}-match-error` : undefined"
        @change="validateField('matchId')"
      >
        <option value="" disabled>Match wählen</option>
        <option v-for="match in sortedMatches" :key="match.id" :value="match.id">
          {{ match.homeTeam }} – {{ match.awayTeam }} ({{ match.date }})
        </option>
      </select>
      <span v-if="errors.matchId" :id="`${uid}-match-error`" class="field-error">{{ errors.matchId }}</span>
      <span v-else-if="!sortedMatches.length" class="field-error">Lege zuerst ein Match an.</span>
    </div>

    <div>
      <label :for="`${uid}-title`" class="field-label">Titel *</label>
      <input
        :id="`${uid}-title`"
        v-model="form.title"
        type="text"
        placeholder="z. B. Aufstellungsgrafik posten"
        class="field-input"
        :aria-invalid="Boolean(errors.title)"
        :aria-describedby="errors.title ? `${uid}-title-error` : undefined"
        @blur="validateField('title')"
      />
      <span v-if="errors.title" :id="`${uid}-title-error`" class="field-error">{{ errors.title }}</span>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label :for="`${uid}-category`" class="field-label">Kategorie *</label>
        <select
          :id="`${uid}-category`"
          v-model="form.category"
          class="field-input"
          :aria-invalid="Boolean(errors.category)"
          @change="validateField('category')"
        >
          <option v-for="item in TASK_CATEGORIES" :key="item" :value="item">{{ item }}</option>
        </select>
        <span v-if="errors.category" class="field-error">{{ errors.category }}</span>
      </div>

      <div>
        <label :for="`${uid}-status`" class="field-label">Status *</label>
        <select
          :id="`${uid}-status`"
          v-model="form.status"
          class="field-input"
          :aria-invalid="Boolean(errors.status)"
          @change="validateField('status')"
        >
          <option v-for="item in TASK_STATUSES" :key="item" :value="item">{{ item }}</option>
        </select>
        <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
      </div>
    </div>

    <div>
      <label :for="`${uid}-publish`" class="field-label">Veröffentlichungszeit</label>
      <input :id="`${uid}-publish`" v-model="form.publishTime" type="datetime-local" class="field-input" />
    </div>

    <div>
      <label :for="`${uid}-notes`" class="field-label">Notizen</label>
      <textarea
        :id="`${uid}-notes`"
        v-model="form.notes"
        rows="3"
        placeholder="Hinweise, Links, Verantwortliche …"
        class="field-input"
      />
    </div>

    <div class="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
      <button v-if="showCancel" type="button" class="btn btn-secondary" @click="emit('cancel')">Abbrechen</button>
      <button type="submit" :disabled="saving" class="btn btn-primary">
        {{ saving ? 'Wird gespeichert …' : isEdit ? 'Änderungen speichern' : 'Aufgabe speichern' }}
      </button>
    </div>
  </form>
</template>