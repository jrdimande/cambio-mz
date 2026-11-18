import { createRouter, createWebHashHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Converter from '../views/Converter.vue'
import Rates from '../views/Rates.vue'
import Comparison from '../views/Comparison.vue'
import About from '../views/About.vue'
import Trends from '../views/Trends.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'dashboard', component: Dashboard, meta: { title: 'Visão geral', eyebrow: 'Cambio-MZ · Taxas de referência' } },
    { path: '/conversor', name: 'converter', component: Converter, meta: { title: 'Conversor', eyebrow: 'Conversão de moedas' } },
    { path: '/taxas', name: 'rates', component: Rates, meta: { title: 'Taxas de câmbio', eyebrow: 'Tabela de referência' } },
    { path: '/comparacao', name: 'comparison', component: Comparison, meta: { title: 'Comparação', eyebrow: 'Comparação de valores' } },
    { path: '/tendencias', name: 'trends', component: Trends, meta: { title: 'Tendências', eyebrow: 'Histórico cambial' } },
    { path: '/sobre', name: 'about', component: About, meta: { title: 'Sobre o Cambio-MZ', eyebrow: 'Sobre a plataforma' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router
