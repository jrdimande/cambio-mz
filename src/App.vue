<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './components/AppSidebar.vue'
import AppNavbar from './components/AppNavbar.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()
const menuOpen = ref(false)

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem('cambio-mz-theme')
    if (savedTheme) return savedTheme === 'dark'
  } catch {
    // Continue with the operating system preference when storage is unavailable.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

const darkMode = ref(getInitialTheme())

watch(darkMode, (enabled) => {
  document.documentElement.classList.toggle('dark-theme', enabled)
  document.documentElement.style.colorScheme = enabled ? 'dark' : 'light'
  try {
    localStorage.setItem('cambio-mz-theme', enabled ? 'dark' : 'light')
  } catch {
    // The selected theme still applies for this visit when storage is unavailable.
  }
}, { immediate: true })

watch(() => route.fullPath, () => { menuOpen.value = false })
</script>

<template>
  <div class="app-shell">
    <AppSidebar :open="menuOpen" @close="menuOpen = false" />
    <div class="app-main">
      <AppNavbar :title="route.meta.title" :eyebrow="route.meta.eyebrow" :dark-mode="darkMode" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" @toggle-theme="darkMode = !darkMode" />
      <main class="page-content">
        <RouterView />
      </main>
      <AppFooter />
    </div>
    <button v-if="menuOpen" class="sidebar-backdrop" aria-label="Fechar menu" @click="menuOpen = false"></button>
  </div>
</template>
