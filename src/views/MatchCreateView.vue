<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppAlert from '@/components/AppAlert.vue'
import AppIcon from '@/components/AppIcon.vue'
import { formatDate } from '@/utils/format'
import { useMatchStore } from '@/stores/matchStore'
import { validateMatch } from '@/utils/validation'

const router = useRouter()
const store = useMatchStore()

const form = reactive({
  externalId: null,
  homeTeam: '',
  awayTeam: '',
  competition: '',
  date: '',
  time: '',
  stadium: '',
})

const errors = ref({})
const saving = ref(false)
const message = ref('')
const submitError = ref('')

const external = reactive({
  league: 'bl1',
  season: String(new Date().getFullYear()),
  loading: false,
  error: '',
  matches: [],
})

function validateField(field) {
  const all = validateMatch(form)
  errors.value = { ...errors.value, [field]: all[field] }
}

async function submit() {
  errors.value = validateMatch(form)
  if (Object.keys(errors.value).length) return

  saving.value = true
  submitError.value = ''
  message.value = ''

  try {
    const match = await store.createMatch(form)
    message.value = 'Match wurde gespeichert.'
    setTimeout(() => router.push(`/matches/${match.id}`), 450)
  } catch (err) {
    submitError.value = err.message || 'Match konnte nicht gespeichert werden.'
  } finally {
    saving.value = false
  }
}

async function loadExternal() {
  external.loading = true
  external.error = ''
  external.matches = []

  try {
    const rows = await store.loadExternalMatches({
      league: external.league,
      season: external.season,
    })

    const now = new Date()
    external.matches = rows
      .filter((match) => match.date && new Date(`${match.date}T${match.time || '00:00'}`) >= now)
      .slice(0, 12)

    if (!external.matches.length) {
      external.error = 'Für diese Liga und Saison wurden keine kommenden Spiele gefunden.'
    }
  } catch (err) {
    external.error = err.message || 'OpenLigaDB konnte nicht geladen werden.'
  } finally {
    external.loading = false
  }
}

function chooseExternal(match) {
  Object.assign(form, match)
  external.matches = []
  message.value = 'Spieldaten übernommen. Prüfe sie und speichere das Match.'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-6">
    <section>
      <RouterLink to="/matches" class="btn btn-ghost btn-sm -ml-3">← Zurück zu den Matches</RouterLink>
      <p class="eyebrow mt-2">Matchday</p>
      <h2 class="page-title">Match erstellen</h2>
      <p class="mt-1 text-muted">Erfasse das Spiel manuell oder übernimm aktuelle Spieldaten aus OpenLigaDB.</p>
    </section>

    <Transition name="fade">
      <AppAlert v-if="message" type="success" :message="message" />
    </Transition>
    <AppAlert v-if="submitError" type="error" :message="submitError" />

    <section class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form class="card p-6" novalidate @submit.prevent="submit">
        <h3 class="text-lg font-bold text-primary">Matchdaten</h3>
        <p class="mt-1 text-sm text-muted">Felder mit * sind Pflichtfelder.</p>

        <div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label for="match-home" class="field-label">Heimteam *</label>
            <input
              id="match-home"
              v-model="form.homeTeam"
              type="text"
              placeholder="z. B. FC Zürich"
              class="field-input"
              :aria-invalid="Boolean(errors.homeTeam)"
              :aria-describedby="errors.homeTeam ? 'match-home-error' : undefined"
              @blur="validateField('homeTeam')"
            />
            <span v-if="errors.homeTeam" id="match-home-error" class="field-error">{{ errors.homeTeam }}</span>
          </div>

          <div>
            <label for="match-away" class="field-label">Auswärtsteam *</label>
            <input
              id="match-away"
              v-model="form.awayTeam"
              type="text"
              placeholder="z. B. FC Basel"
              class="field-input"
              :aria-invalid="Boolean(errors.awayTeam)"
              :aria-describedby="errors.awayTeam ? 'match-away-error' : undefined"
              @blur="validateField('awayTeam')"
            />
            <span v-if="errors.awayTeam" id="match-away-error" class="field-error">{{ errors.awayTeam }}</span>
          </div>

          <div>
            <label for="match-date" class="field-label">Datum *</label>
            <input
              id="match-date"
              v-model="form.date"
              type="date"
              class="field-input"
              :aria-invalid="Boolean(errors.date)"
              :aria-describedby="errors.date ? 'match-date-error' : undefined"
              @blur="validateField('date')"
            />
            <span v-if="errors.date" id="match-date-error" class="field-error">{{ errors.date }}</span>
          </div>

          <div>
            <label for="match-time" class="field-label">Anspielzeit *</label>
            <input
              id="match-time"
              v-model="form.time"
              type="time"
              class="field-input"
              :aria-invalid="Boolean(errors.time)"
              :aria-describedby="errors.time ? 'match-time-error' : undefined"
              @blur="validateField('time')"
            />
            <span v-if="errors.time" id="match-time-error" class="field-error">{{ errors.time }}</span>
          </div>

          <div>
            <label for="match-competition" class="field-label">Wettbewerb</label>
            <input id="match-competition" v-model="form.competition" type="text" placeholder="z. B. Super League" class="field-input" />
          </div>

          <div>
            <label for="match-stadium" class="field-label">Stadion</label>
            <input id="match-stadium" v-model="form.stadium" type="text" placeholder="z. B. Letzigrund" class="field-input" />
          </div>
        </div>

        <div class="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <RouterLink to="/matches" class="btn btn-secondary">Abbrechen</RouterLink>
          <button type="submit" :disabled="saving" class="btn btn-primary">
            {{ saving ? 'Speichert …' : 'Match speichern' }}
          </button>
        </div>
      </form>

      <aside class="card p-6">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-accent">
            <AppIcon name="ball" />
          </span>
          <div>
            <h3 class="text-lg font-bold text-primary">OpenLigaDB</h3>
            <p class="text-sm text-muted">Reale Spieldaten übernehmen.</p>
          </div>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div>
            <label for="external-league" class="field-label">Liga</label>
            <select id="external-league" v-model="external.league" class="field-input">
              <option value="bl1">1. Bundesliga</option>
              <option value="bl2">2. Bundesliga</option>
              <option value="bl3">3. Liga</option>
              <option value="ucl">Champions League</option>
              <option value="dfb">DFB-Pokal</option>
            </select>
          </div>

          <div>
            <label for="external-season" class="field-label">Saison</label>
            <input id="external-season" v-model="external.season" type="number" min="2000" max="2100" class="field-input" />
          </div>
        </div>

        <button type="button" :disabled="external.loading" class="btn btn-dark mt-4 w-full" @click="loadExternal">
          {{ external.loading ? 'Lädt Spieldaten …' : 'Spieldaten laden' }}
        </button>

        <AppAlert v-if="external.error" class="mt-4" type="error" :message="external.error">
          <button type="button" class="text-xs font-bold underline" @click="loadExternal">Erneut versuchen</button>
        </AppAlert>

        <p v-if="external.matches.length" class="mt-4 text-xs font-semibold text-muted">
          {{ external.matches.length }} kommende Spiele – wähle eines aus:
        </p>

        <TransitionGroup name="list" tag="div" class="mt-2 max-h-[28rem] space-y-2 overflow-y-auto">
          <button
            v-for="match in external.matches"
            :key="match.externalId"
            type="button"
            class="w-full rounded-xl border border-border p-3 text-left transition hover:border-primary hover:bg-background"
            @click="chooseExternal(match)"
          >
            <span class="block text-xs font-semibold text-muted">{{ formatDate(match.date) }} · {{ match.time }} Uhr</span>
            <span class="mt-1 block text-sm font-bold text-primary">{{ match.homeTeam }} – {{ match.awayTeam }}</span>
            <span v-if="match.stadium" class="mt-0.5 block text-xs text-muted">{{ match.stadium }}</span>
          </button>
        </TransitionGroup>
      </aside>
    </section>
  </div>
</template>
