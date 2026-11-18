<script setup>
import { useCurrencies } from '../composables/useCurrencies'
import CurrencyConverter from '../components/CurrencyConverter.vue'

const { currencies } = useCurrencies()
</script>

<template>
  <div class="page-stack">
    <section class="page-intro"><div><span class="section-kicker">CONVERSÃO DE MOEDAS</span><h2>Conversor</h2><p>Escolha as moedas e introduza um valor.</p></div></section>
    <CurrencyConverter :currencies="currencies" allow-email />
  </div>
</template>
