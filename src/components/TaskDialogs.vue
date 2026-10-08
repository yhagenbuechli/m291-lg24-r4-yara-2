<script setup>
import { ref } from 'vue'
import AppModal from '@/components/AppModal.vue'
import TaskForm from '@/components/TaskForm.vue'
import { useMatchStore } from '@/stores/matchStore'

// Dialoge zum Bearbeiten und Löschen einer Aufgabe.
// Die Eltern-View setzt die Aufgabe per v-model:edit-task bzw. v-model:delete-task.
const editTask = defineModel('editTask', { type: Object, default: null })
const deleteTask = defineModel('deleteTask', { type: Object, default: null })

const emit = defineEmits(['notify'])

const store = useMatchStore()
const deletingNow = ref(false)

function onSaved() {
  editTask.value = null
  emit('notify', 'success', 'Änderungen wurden gespeichert.')
}

async function confirmDelete() {
  const task = deleteTask.value
  if (!task) return

  deletingNow.value = true
  try {
    await store.deleteTask(task.id)
    deleteTask.value = null
    emit('notify', 'success', `«${task.title}» wurde gelöscht.`)
  } catch (err) {
    deleteTask.value = null
    emit('notify', 'error', err.message || 'Aufgabe konnte nicht gelöscht werden.')
  } finally {
    deletingNow.value = false
  }
}
</script>

<template>
  <AppModal
    :open="Boolean(editTask)"
    title="Aufgabe bearbeiten"
    :description="editTask ? store.getMatchLabel(editTask.matchId) : ''"
    @close="editTask = null"
  >
    <TaskForm v-if="editTask" :key="editTask.id" :task="editTask" @saved="onSaved" @cancel="editTask = null" />
  </AppModal>

  <AppModal :open="Boolean(deleteTask)" title="Aufgabe löschen" size="sm" @close="deleteTask = null">
    <p v-if="deleteTask" class="text-sm">
      Willst du «<strong>{{ deleteTask.title }}</strong>» wirklich löschen? Das kann nicht rückgängig gemacht werden.
    </p>
    <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <button type="button" class="btn btn-secondary" @click="deleteTask = null">Abbrechen</button>
      <button type="button" class="btn btn-danger" :disabled="deletingNow" @click="confirmDelete">
        {{ deletingNow ? 'Wird gelöscht …' : 'Löschen' }}
      </button>
    </div>
  </AppModal>
</template>