<script setup>
import { RouterView } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopBar from '@/components/AppTopBar.vue'
import AppMobileNav from '@/components/AppMobileNav.vue'
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppSidebar />

    <div class="md:pl-64">
      <AppTopBar />

      <main class="min-h-[calc(100vh-4rem)] px-4 py-6 pb-24 sm:px-6 lg:px-8 md:pb-8">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <AppMobileNav />
  </div>
</template>
