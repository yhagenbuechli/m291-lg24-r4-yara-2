import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import MatchesView from '@/views/MatchesView.vue'
import MatchDetailView from '@/views/MatchDetailView.vue'
import MatchCreateView from '@/views/MatchCreateView.vue'
import TasksView from '@/views/TasksView.vue'
import TemplatesView from '@/views/TemplatesView.vue'
import StatisticsView from '@/views/StatisticsView.vue'
import MediaView from '@/views/MediaView.vue'
import SettingsView from '@/views/SettingsView.vue'
import AboutView from '@/views/AboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: HomeView, meta: { title: 'Übersicht' } },
    { path: '/matches', name: 'matches', component: MatchesView, meta: { title: 'Matches' } },
    { path: '/matches/new', name: 'match-create', component: MatchCreateView, meta: { title: 'Match erstellen' } },
    { path: '/matches/:id', name: 'match-detail', component: MatchDetailView, meta: { title: 'Matchdetail' } },
    { path: '/tasks', name: 'tasks', component: TasksView, meta: { title: 'Aufgaben' } },
    { path: '/templates', name: 'templates', component: TemplatesView, meta: { title: 'Vorlagen' } },
    { path: '/statistics', name: 'statistics', component: StatisticsView, meta: { title: 'Statistiken' } },
    { path: '/media', name: 'media', component: MediaView, meta: { title: 'Mediathek' } },
    { path: '/settings', name: 'settings', component: SettingsView, meta: { title: 'Einstellungen' } },
    { path: '/about', name: 'about', component: AboutView, meta: { title: 'Über & Datenschutz' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Matchday'} · Matchday Content Planner`
  window.scrollTo({ top: 0, behavior: 'auto' })
})

export default router
