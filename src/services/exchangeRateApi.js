const API_URL = 'https://api.frankfurter.dev/v2'
const currencyNames = new Intl.DisplayNames(['pt-MZ', 'pt'], { type: 'currency' })

async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
  return response.json()
}

function getCurrencyName(code, apiName) {
  try {
    const localized = currencyNames.of(code)
    if (localized && localized !== code) return localized
  } catch { /* Alguns ativos não têm nome localizado no browser. */ }
  return apiName || code
}

export async function fetchExchangeRates() {
  const [catalog, rates] = await Promise.all([
    getJson(`${API_URL}/currencies`),
    getJson(`${API_URL}/rates?base=MZN`),
  ])
  const rateByCode = new Map(rates.map(({ quote, rate }) => [quote, rate]))
  const supportedCodes = new Set(rateByCode.keys())
  const currencies = catalog
    .filter(({ iso_code: code }) => supportedCodes.has(code))
    .map(({ iso_code: code, name }) => ({
      code,
      name: getCurrencyName(code, name),
      country: getCurrencyName(code, name),
      countryCode: '',
      valueMzn: parseFloat((1 / rateByCode.get(code)).toFixed(6)),
    }))
    .filter(({ valueMzn }) => Number.isFinite(valueMzn))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'))
  const latestDate = rates.reduce((latest, row) => row.date > latest ? row.date : latest, '')
  return { currencies, updatedAt: latestDate ? new Date(`${latestDate}T00:00:00`) : null }
}

export async function fetchCurrencyTrend(code, { from, to, group }) {
  const params = new URLSearchParams({ base: 'MZN', quotes: code, from, to })
  if (group) params.set('group', group)
  const rows = await getJson(`${API_URL}/rates?${params}`)
  return rows
    .filter((row) => row.quote === code && Number.isFinite(row.rate) && row.rate > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
}
