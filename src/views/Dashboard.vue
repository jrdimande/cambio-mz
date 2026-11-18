<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCurrencies } from '../composables/useCurrencies'
import { formatNumber } from '../utils/formatters'
import CurrencyConverter from '../components/CurrencyConverter.vue'
import ComparisonChart from '../components/ComparisonChart.vue'
import CurrencyTable from '../components/CurrencyTable.vue'
import CurrencyFlag from '../components/CurrencyFlag.vue'

const { currencies, hasCurrencies, usingFallback } = useCurrencies()
const ranked = computed(() => currencies.value.slice().sort((a, b) => b.valueMzn - a.valueMzn))
</script>

<template>
  <div class="page-stack">
    <section class="dashboard-intro">
      <div class="intro-overline"><span></span> CÂMBIO-MZ · FERRAMENTAS</div>
      <h2>Converta e compare moedas.</h2>
      <div class="intro-bottom">
        <p>Simule conversões e consulte valores de referência em meticais.</p>
        <span class="sample-notice"><i class="bi bi-info-circle"></i> {{ usingFallback ? 'Dados locais de demonstração' : 'Taxas de referência via API' }}</span>
      </div>
    </section>

    <template v-if="hasCurrencies">
      <section class="dashboard-converter">
        <div class="dashboard-section-heading">
          <div><span class="section-kicker">CONVERSOR</span><h3>Conversão de moedas</h3></div>
          <RouterLink to="/conversor" class="text-link">Abrir conversor <i class="bi bi-arrow-up-right"></i></RouterLink>
        </div>
        <CurrencyConverter compact :currencies="currencies" />
      </section>

      <section class="dashboard-data-grid">
        <ComparisonChart compact :currencies="currencies" />
        <section class="currency-list-panel">
          <div class="dashboard-section-heading">
            <div><span class="section-kicker">MOEDAS</span><h3>Valores por moeda</h3></div>
            <RouterLink to="/taxas" class="text-link">Ver todas <i class="bi bi-arrow-up-right"></i></RouterLink>
          </div>
          <div class="currency-list">
            <div v-for="currency in ranked.slice(0, 5)" :key="currency.code" class="currency-list-row">
              <span class="list-currency-code"><CurrencyFlag :country-code="currency.countryCode" :country-name="currency.country" />{{ currency.code }}</span>
              <span class="list-currency-name">{{ currency.name }}</span>
              <strong>{{ formatNumber(currency.valueMzn) }} <small>MZN</small></strong>
            </div>
          </div>
          <p class="list-footnote">Taxas indicativas; confirme os valores junto da sua instituição financeira.</p>
        </section>
      </section>
    </template>
  </div>
</template>
