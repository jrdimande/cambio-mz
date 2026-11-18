<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

defineProps({ title: String, eyebrow: String, darkMode: Boolean, menuOpen: Boolean })
const emit = defineEmits(['toggle-menu', 'toggle-theme'])
const router = useRouter()
const searchInput = ref(null)
const query = ref('')
const today = computed(() => new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'full' }).format(new Date()))

watch(() => router.currentRoute.value.query.q, (value) => {
  query.value = typeof value === 'string' ? value : ''
}, { immediate: true })

function search() {
  if (!query.value.trim()) return
  router.push({ name: 'rates', query: { q: query.value.trim() } })
}

function handleSearchShortcut(event) {
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey
    && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
    event.preventDefault()
    searchInput.value?.focus()
  }
  if (event.key === 'Escape' && document.activeElement === searchInput.value) {
    query.value = ''
    if (router.currentRoute.value.name === 'rates') {
      router.replace({ query: { ...router.currentRoute.value.query, q: undefined } })
    }
    searchInput.value?.blur()
  }
}

onMounted(() => window.addEventListener('keydown', handleSearchShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', handleSearchShortcut))
</script>

<template>
  <header class="topbar">
    <button class="mobile-menu" :aria-label="menuOpen ? 'Fechar menu' : 'Abrir menu'" aria-controls="app-navigation" :aria-expanded="menuOpen" @click="emit('toggle-menu')"><i :class="['bi', menuOpen ? 'bi-x-lg' : 'bi-list']"></i></button>
    <div class="topbar-heading"><span>{{ eyebrow }}</span><h1>{{ title }}</h1></div>
    <div class="topbar-actions">
      <form class="top-search" role="search" @submit.prevent="search">
        <i class="bi bi-search"></i>
        <input ref="searchInput" v-model="query" type="search" aria-label="Pesquisar moeda" placeholder="Pesquisar moeda…" autocomplete="off" />
        <kbd>/</kbd>
      </form>
      <div class="top-date"><i class="bi bi-calendar3"></i><span>{{ today }}</span></div>
      <span class="demo-badge"><i></i> TAXAS DE REFERÊNCIA</span>
      <button
        class="theme-toggle"
        type="button"
        :aria-label="darkMode ? 'Ativar tema claro' : 'Ativar tema escuro'"
        :aria-pressed="darkMode"
        @click="emit('toggle-theme')"
      ><i :class="['bi', darkMode ? 'bi-sun' : 'bi-moon-stars']"></i></button>
    </div>
  </header>
</template>
