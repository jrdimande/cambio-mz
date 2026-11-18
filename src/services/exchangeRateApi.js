const BASE_URL = 'https://open.er-api.com/v6/latest'

const CURRENCY_META = {
  USD: { name: 'Dólar dos Estados Unidos', country: 'Estados Unidos', countryCode: 'us' },
  EUR: { name: 'Euro',                      country: 'União Europeia',  countryCode: 'eu' },
  ZAR: { name: 'Rand sul-africano',         country: 'África do Sul',   countryCode: 'za' },
  GBP: { name: 'Libra esterlina',           country: 'Reino Unido',     countryCode: 'gb' },
  BWP: { name: 'Pula do Botswana',          country: 'Botswana',        countryCode: 'bw' },
  TZS: { name: 'Xelim tanzaniano',          country: 'Tanzânia',        countryCode: 'tz' },
  KES: { name: 'Xelim queniano',            country: 'Quénia',          countryCode: 'ke' },
  CNY: { name: 'Yuan chinês',               country: 'China',           countryCode: 'cn' },
}

export async function fetchExchangeRates() {
  const response = await fetch(`${BASE_URL}/MZN`)
  if (!response.ok) throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
  const data = await response.json()
  if (data.result !== 'success') throw new Error('A API devolveu um resultado inesperado.')
  const currencies = Object.entries(CURRENCY_META)
    .filter(([code]) => code in data.rates)
    .map(([code, meta]) => ({
      code,
      ...meta,
      valueMzn: parseFloat((1 / data.rates[code]).toFixed(6)),
    }))
  return { currencies, updatedAt: new Date(data.time_last_update_utc) }
}
