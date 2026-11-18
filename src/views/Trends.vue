<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Chart from 'chart.js/auto'
import { useCurrencies } from '../composables/useCurrencies'
import { fetchCurrencyTrend } from '../services/exchangeRateApi'
import { formatNumber } from '../utils/formatters'

const { currencies, usingFallback } = useCurrencies()
const selectedCode = ref('USD')
const selectedPeriod = ref('30d')
const loading = ref(false)
const error = ref('')
const observations = ref([])
const canvas = ref(null)
let chart
let themeObserver

const periods = [
  { value: '30d', label: '30 dias', days: 30 },
  { value: '90d', label: '90 dias', days: 90 },
  { value: '1y', label: '1 ano', days: 365 },
]
const currency = computed(() => currencies.value.find((item) => item.code === selectedCode.value))
const firstRate = computed(() => observations.value[0]?.rate)
const lastRate = computed(() => observations.value.at(-1)?.rate)
const changePercent = computed(() => firstRate.value && lastRate.value
  ? ((firstRate.value / lastRate.value) - 1) * 100
  : null)
const trendLabel = computed(() => changePercent.value === null ? ''
  : changePercent.value > 0.05 ? 'Subida'
    : changePercent.value < -0.05 ? 'Queda' : 'Estável')

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-MZ', { day: '2-digit', month: 'short' }).format(new Date(`${date}T00:00:00`))
}

async function loadTrend() {
  if (!selectedCode.value) return
  if (usingFallback.value) {
    error.value = 'O histórico não está disponível com os dados locais de demonstração.'
    return
  }
  loading.value = true
  error.value = ''
  observations.value = []
  chart?.destroy()
  chart = null
  try {
    const range = periods.find((item) => item.value === selectedPeriod.value)
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - range.days)
    const isoDate = (date) => date.toISOString().slice(0, 10)
    const group = selectedPeriod.value === '90d' ? 'week' : selectedPeriod.value === '1y' ? 'month' : undefined
    observations.value = await fetchCurrencyTrend(selectedCode.value, {
      from: isoDate(from), to: isoDate(to), group,
    })
    if (observations.value.length < 2) error.value = 'Não há histórico suficiente para calcular a tendência desta moeda.'
  } catch (err) {
    error.value = err.message || 'Não foi possível carregar o histórico cambial.'
  } finally {
    loading.value = false
    await nextTick()
    renderChart()
  }
}

function renderChart() {
  if (!canvas.value || observations.value.length < 2) return
  const theme = getComputedStyle(document.documentElement)
  const textColor = theme.getPropertyValue('--chart-text').trim() || '#66736b'
  const gridColor = theme.getPropertyValue('--chart-grid').trim() || '#e1e7e2'
  const first = observations.value[0].rate
  const changes = observations.value.map((item) => ((first / item.rate) - 1) * 100)
  chart?.destroy()
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: observations.value.map((item) => formatDate(item.date)),
      datasets: [{
        label: 'Variação desde o início',
        data: changes,
        backgroundColor: changes.map((value) => value >= 0 ? 'rgba(49, 123, 90, .78)' : 'rgba(190, 73, 73, .72)'),
        borderRadius: 2,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => ` ${formatNumber(context.parsed.y)}% desde o início do período` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor, maxTicksLimit: 10 } },
        y: { title: { display: true, text: 'Variação (%)', color: textColor }, grid: { color: gridColor }, ticks: { color: textColor, callback: (value) => `${value}%` } },
      },
    },
  })
}

watch([selectedCode, selectedPeriod], loadTrend, { immediate: true })
watch(observations, renderChart, { deep: true })
watch(currencies, (list) => {
  if (!list.some((item) => item.code === selectedCode.value)) {
    selectedCode.value = list.some((item) => item.code === 'USD') ? 'USD' : list[0]?.code ?? ''
  }
}, { immediate: true })
watch(usingFallback, (fallback) => {
  if (fallback) error.value = 'O histórico não está disponível com os dados locais de demonstração.'
})
onMounted(() => {
  themeObserver = new MutationObserver(renderChart)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})
onBeforeUnmount(() => {
  themeObserver?.disconnect()
  chart?.destroy()
})
</script>

<template>
  <div class="page-stack">
    <section class="page-intro">
      <div><span class="section-kicker">HISTÓRICO CAMBIAL · API FRANKFURTER</span><h2>Tendência das moedas</h2><p>Acompanhe como o valor de uma moeda em meticais variou ao longo do tempo.</p></div>
      <div class="intro-icon"><i class="bi bi-graph-up-arrow"></i></div>
    </section>

    <section class="table-panel trend-controls">
      <label>Moeda
        <select v-model="selectedCode" :disabled="!currencies.length || loading">
          <option v-for="item in currencies" :key="item.code" :value="item.code">{{ item.name }} ({{ item.code }})</option>
        </select>
      </label>
      <fieldset>
        <legend>Período</legend>
        <button v-for="period in periods" :key="period.value" type="button" :class="{ active: selectedPeriod === period.value }" :aria-pressed="selectedPeriod === period.value" @click="selectedPeriod = period.value">{{ period.label }}</button>
      </fieldset>
    </section>

    <section class="chart-panel trend-panel">
      <div class="panel-heading chart-heading">
        <div><span class="section-kicker">{{ currency?.name ?? selectedCode }}</span><h2>Variação face ao início do período</h2><p>Uma unidade da moeda selecionada, expressa em MZN.</p></div>
        <div v-if="changePercent !== null" class="trend-summary" :class="trendLabel.toLowerCase()">
          <i :class="['bi', trendLabel === 'Subida' ? 'bi-arrow-up-right' : trendLabel === 'Queda' ? 'bi-arrow-down-right' : 'bi-arrow-right']"></i>
          <strong>{{ trendLabel }} {{ Math.abs(changePercent).toFixed(2) }}%</strong>
        </div>
      </div>
      <div v-if="loading" class="chart-empty"><i class="bi bi-arrow-repeat spinning"></i><span>A carregar histórico cambial…</span></div>
      <div v-else-if="usingFallback" class="chart-empty"><i class="bi bi-wifi-off"></i><span>O histórico exige uma ligação à API; os dados locais são apenas para demonstração.</span></div>
      <div v-else-if="error" class="chart-empty"><i class="bi bi-exclamation-circle"></i><span>{{ error }}</span><button type="button" class="refresh-button" @click="loadTrend">Tentar novamente</button></div>
      <div v-else class="chart-canvas-wrap trend-canvas"><canvas ref="canvas" aria-label="Gráfico de barras da tendência cambial" role="img"></canvas></div>
      <div class="chart-disclaimer"><i class="bi bi-info-circle"></i> Dados históricos de referência, publicados por fontes oficiais e bancos centrais. A tendência passada não prevê valores futuros nem representa uma cotação de transação.</div>
    </section>
  </div>
</template>

<style scoped>
.trend-controls { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 16px; }
.trend-controls label { display: grid; flex: 1 1 280px; gap: 7px; color: var(--muted); font-size: 12px; font-weight: 600; }
.trend-controls select { width: 100%; min-height: 40px; padding: 8px 12px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--ink); }
.trend-controls fieldset { display: flex; gap: 6px; margin: 0; padding: 0; border: 0; }
.trend-controls legend { width: 100%; margin-bottom: 7px; color: var(--muted); font-size: 12px; font-weight: 600; }
.trend-controls fieldset button { padding: 9px 13px; border: 1px solid var(--line); border-radius: 4px; background: var(--surface); color: var(--ink); font-size: 12px; cursor: pointer; }
.trend-controls fieldset button.active { border-color: var(--green); background: var(--green); color: #fff; }
.trend-panel { min-width: 0; }
.trend-canvas { height: 360px; }
.trend-summary { display: flex; align-items: center; gap: 6px; white-space: nowrap; font-size: 14px; }
.trend-summary.subida { color: var(--green); }
.trend-summary.queda { color: #be4949; }
.trend-summary.estável { color: var(--muted); }
.chart-empty button { margin-top: 6px; }
@media (max-width: 620px) { .trend-controls { align-items: stretch; } .trend-controls fieldset { flex-wrap: wrap; } .trend-canvas { height: 280px; } .trend-summary { font-size: 11px; } }
</style>
