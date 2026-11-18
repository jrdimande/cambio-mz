import { computed, onMounted, ref } from 'vue'
import { fetchExchangeRates } from '../services/exchangeRateApi'
import { demoCurrencies } from '../data/demoCurrencies'

const currencies    = ref([])
const updatedAt     = ref(null)
const loading       = ref(false)
const error         = ref(null)
const usingFallback = ref(false)

export function useCurrencies() {
  const hasCurrencies = computed(() => currencies.value.length > 0)
  const refreshing    = computed(() => loading.value)

  async function loadRates() {
    loading.value = true
    error.value   = null
    usingFallback.value = false
    try {
      const { currencies: live, updatedAt: ts } = await fetchExchangeRates()
      currencies.value = live
      updatedAt.value  = ts
    } catch (err) {
      console.warn('[useCurrencies] API indisponível, usando dados demo.', err)
      error.value      = err.message
      currencies.value = demoCurrencies
      updatedAt.value  = new Date()
      usingFallback.value = true
    } finally {
      loading.value = false
    }
  }

  async function reloadDemo() { await loadRates() }

  onMounted(() => { if (currencies.value.length === 0) loadRates() })

  return { currencies, updatedAt, refreshedAt: updatedAt, loading, refreshing,
           error, usingFallback, hasCurrencies, loadRates, reloadDemo }
}
