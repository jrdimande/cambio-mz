<script setup>
defineProps({ open: Boolean })
defineEmits(['close'])

const links = [
  { to: '/', label: 'Visão geral', icon: 'bi-grid-1x2' },
  { to: '/conversor', label: 'Conversor', icon: 'bi-arrow-left-right' },
  { to: '/taxas', label: 'Taxas de câmbio', icon: 'bi-list-columns-reverse' },
  { to: '/comparacao', label: 'Comparação', icon: 'bi-bar-chart-line' },
  { to: '/sobre', label: 'Sobre', icon: 'bi-info-circle' },
]
</script>

<template>
  <aside class="app-sidebar" :class="{ 'is-open': open }">
    <div class="brand-lockup">
      <div class="brand-mark"><span>c</span></div>
      <div><span class="brand-name">cambio<span>mz</span></span><small>Ferramentas de câmbio</small></div>
      <button class="sidebar-close" aria-label="Fechar menu" @click="$emit('close')"><i class="bi bi-x-lg"></i></button>
    </div>

    <div class="nav-caption">NAVEGAÇÃO</div>
    <nav class="side-nav" aria-label="Navegação principal">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="side-link" :exact-active-class="link.to === '/' ? 'active' : ''">
        <i :class="['bi', link.icon]"></i><span>{{ link.label }}</span>
        <i v-if="link.to === '/'" class="bi bi-chevron-right nav-chevron"></i>
      </RouterLink>
    </nav>

    <div class="sidebar-bottom">
      <div class="sidebar-demo-card">
        <div class="demo-icon"><i class="bi bi-bar-chart-line"></i></div>
        <p>Cotações via API</p>
        <small>Valores de referência atualizados a partir de uma API externa.</small>
      </div>
      <div class="sidebar-legal">© {{ new Date().getFullYear() }} Cambio-MZ</div>
    </div>
  </aside>
</template>
