<script setup>
import { useCurrencies } from '../composables/useCurrencies'
import CurrencyTable from '../components/CurrencyTable.vue'

const { currencies, updatedAt, refreshing, usingFallback, loadRates } = useCurrencies()
</script>

<template>
  <div class="page-stack">
    <section class="page-intro"><div><span class="section-kicker">{{ usingFallback ? 'DADOS DE DEMONSTRAÇÃO' : 'TAXAS DE REFERÊNCIA · API' }}</span><h2>Taxas de câmbio</h2><p>{{ usingFallback ? 'A API está indisponível; são apresentados valores de demonstração.' : 'Valores de referência em meticais, obtidos através da API pública Frankfurter.' }}<span v-if="updatedAt"> Atualizado: {{ new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'short' }).format(updatedAt) }}.</span></p></div><button class="refresh-button" :disabled="refreshing" @click="loadRates"><i :class="['bi', refreshing ? 'bi-arrow-repeat spinning' : 'bi-arrow-clockwise']"></i> Atualizar</button></section>
    <CurrencyTable :currencies="currencies" />
  </div>
</template>
