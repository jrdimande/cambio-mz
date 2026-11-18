<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatNumber } from '../utils/formatters'
import CurrencyFlag from './CurrencyFlag.vue'

const props = defineProps({ currencies: { type: Array, default: () => [] } })
const route = useRoute()
const router = useRouter()
const search = ref(typeof route.query.q === 'string' ? route.query.q : '')
const direction = ref('desc')

function normalizeSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt')
}

watch(() => route.query.q, (value) => { search.value = typeof value === 'string' ? value : '' })
watch(search, (value) => {
  const query = { ...route.query }
  if (value.trim()) query.q = value.trim()
  else delete query.q
  router.replace({ query })
})

const filteredCurrencies = computed(() => {
  const term = normalizeSearch(search.value.trim())
  return props.currencies
    .filter((currency) => !term || normalizeSearch(currency.code).includes(term) || normalizeSearch(currency.name).includes(term))
    .slice()
    .sort((a, b) => direction.value === 'asc' ? a.valueMzn - b.valueMzn : b.valueMzn - a.valueMzn)
})
</script>

<template>
  <section class="table-panel">
    <div class="panel-heading table-heading">
      <div><span class="section-kicker">TAXAS DE REFERÊNCIA</span><h2>Valores por moeda</h2><p>Valores de referência expressos em meticais (MZN).</p></div>
      <div class="table-controls">
        <label class="table-search"><i class="bi bi-search"></i><input v-model="search" placeholder="Pesquisar moeda..." aria-label="Pesquisar moeda" /></label>
        <button class="sort-button" :aria-label="direction === 'desc' ? 'Ordenar crescente' : 'Ordenar decrescente'" @click="direction = direction === 'desc' ? 'asc' : 'desc'">
          <i class="bi bi-sort-down"></i><span>{{ direction === 'desc' ? 'Maior valor' : 'Menor valor' }}</span>
        </button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table currency-table">
        <thead><tr><th>MOEDA</th><th class="currency-code-column">CÓDIGO</th><th class="text-end">VALOR DE REFERÊNCIA</th><th class="table-action-column"></th></tr></thead>
        <tbody>
          <tr v-for="currency in filteredCurrencies" :key="currency.code">
            <td><div class="table-currency"><CurrencyFlag :country-code="currency.countryCode" :country-name="currency.country" /><strong>{{ currency.name }}</strong><span class="table-code-inline">{{ currency.code }}</span></div></td>
            <td class="currency-code-column"><span class="table-code">{{ currency.code }}</span></td>
            <td class="text-end"><strong class="table-rate">{{ formatNumber(currency.valueMzn) }}</strong><span class="table-unit"> MZN</span></td>
            <td class="text-end table-action-column"><i class="bi bi-chevron-right table-arrow"></i></td>
          </tr>
          <tr v-if="filteredCurrencies.length === 0"><td colspan="4" class="empty-row"><i class="bi bi-search"></i><strong>Nenhuma moeda encontrada</strong><span>Ajuste a pesquisa e tente novamente.</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="table-footnote"><i class="bi bi-info-circle"></i> Taxas indicativas obtidas por API; podem diferir das taxas praticadas por instituições financeiras.</div>
  </section>
</template>
