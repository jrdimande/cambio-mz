<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

defineProps({ title: String, eyebrow: String, darkMode: Boolean })
const emit = defineEmits(['toggle-menu', 'toggle-theme'])
const router = useRouter()
const query = ref('')
const today = computed(() => new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'full' }).format(new Date()))

function search() {
  if (!query.value.trim()) return
  router.push({ name: 'rates', query: { q: query.value.trim() } })
}
</script>

<template>
  <header class="topbar">
    <button class="mobile-menu" aria-label="Abrir menu" @click="emit('toggle-menu')"><i class="bi bi-list"></i></button>
    <div class="topbar-heading"><span>{{ eyebrow }}</span><h1>{{ title }}</h1></div>
    <div class="topbar-actions">
      <form class="top-search" role="search" @submit.prevent="search">
        <i class="bi bi-search"></i>
        <input v-model="query" aria-label="Pesquisar moeda" placeholder="Pesquisar..." />
        <kbd>↵</kbd>
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
