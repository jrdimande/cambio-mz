<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'
import CurrencyFlag from './CurrencyFlag.vue'

const props = defineProps({
  currencies: { type: Array, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
const root = ref(null)
const trigger = ref(null)
const searchInput = ref(null)
const open = ref(false)
const search = ref('')
const activeIndex = ref(0)
const listId = `currency-options-${useId()}`
const selectedCurrency = computed(() => props.currencies.find((currency) => currency.code === props.modelValue))

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt')
}

const filteredCurrencies = computed(() => {
  const term = normalize(search.value.trim())
  if (!term) return props.currencies
  return props.currencies.filter((currency) =>
    [currency.code, currency.name, currency.country]
      .filter(Boolean)
      .some((value) => normalize(value).includes(term)),
  )
})

async function closeMenu(restoreFocus = false) {
  open.value = false
  search.value = ''
  activeIndex.value = 0
  if (restoreFocus) {
    await nextTick()
    trigger.value?.focus()
  }
}

async function toggleMenu() {
  if (open.value) {
    await closeMenu()
    return
  }
  search.value = ''
  activeIndex.value = 0
  open.value = true
  await nextTick()
  searchInput.value?.focus()
}

async function chooseCurrency(currency) {
  emit('update:modelValue', currency.code)
  await closeMenu(true)
}

function moveActiveOption(direction) {
  const lastIndex = filteredCurrencies.value.length - 1
  if (lastIndex < 0) return
  activeIndex.value = Math.min(lastIndex, Math.max(0, activeIndex.value + direction))
  nextTick(() => root.value?.querySelector(`#${listId} [data-active="true"]`)?.scrollIntoView({ block: 'nearest' }))
}

function handleSearchKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActiveOption(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActiveOption(-1)
  } else if (event.key === 'Enter' && filteredCurrencies.value[activeIndex.value]) {
    event.preventDefault()
    chooseCurrency(filteredCurrencies.value[activeIndex.value])
  }
}

watch(search, (value) => {
  activeIndex.value = 0
  const term = normalize(value.trim())
  if (!open.value || !term) return
  const exactMatch = props.currencies.find((currency) =>
    normalize(currency.code) === term || normalize(currency.name) === term,
  )
  if (exactMatch) chooseCurrency(exactMatch)
})

function closeOnOutsideClick(event) {
  if (!root.value?.contains(event.target)) closeMenu()
}

onMounted(() => document.addEventListener('pointerdown', closeOnOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsideClick))
</script>

<template>
  <div ref="root" class="currency-picker" @keydown.esc.stop.prevent="closeMenu(true)">
    <button
      ref="trigger"
      class="currency-picker-trigger"
      type="button"
      :aria-label="`${label}: ${selectedCurrency?.country ?? selectedCurrency?.code ?? 'Selecionar moeda'}`"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="toggleMenu"
    >
      <CurrencyFlag :country-code="selectedCurrency?.countryCode" :country-name="selectedCurrency?.country" />
      <span class="picker-selected-code">{{ selectedCurrency?.code ?? '—' }}</span>
      <i class="bi bi-chevron-down picker-chevron" aria-hidden="true"></i>
    </button>
    <div v-if="open" class="currency-picker-menu" :aria-label="`${label} — pesquisar e selecionar`">
      <label class="picker-search">
        <i class="bi bi-search" aria-hidden="true"></i>
        <input
          ref="searchInput"
          v-model="search"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          :aria-label="`Pesquisar ${label.toLowerCase()}`"
          :aria-expanded="open"
          :aria-controls="listId"
          :aria-activedescendant="filteredCurrencies[activeIndex] ? `${listId}-${filteredCurrencies[activeIndex].code}` : undefined"
          placeholder="Pesquisar por nome ou código…"
          autocomplete="off"
          @keydown="handleSearchKeydown"
        />
      </label>
      <div :id="listId" class="currency-picker-options" role="listbox" :aria-label="label">
        <button
          v-for="(currency, index) in filteredCurrencies"
          :id="`${listId}-${currency.code}`"
          :key="currency.code"
          class="currency-picker-option"
          :class="{ 'is-selected': currency.code === modelValue, 'is-highlighted': index === activeIndex }"
          :data-active="index === activeIndex"
          type="button"
          role="option"
          :aria-selected="currency.code === modelValue"
          @mouseenter="activeIndex = index"
          @click="chooseCurrency(currency)"
        >
          <CurrencyFlag :country-code="currency.countryCode" :country-name="currency.country" />
          <span class="picker-option-copy"><strong>{{ currency.name }}</strong><small>{{ currency.code }}</small></span>
          <span class="picker-option-code">{{ currency.code }}</span>
        </button>
        <p v-if="filteredCurrencies.length === 0" class="picker-no-results">Nenhuma moeda encontrada.</p>
      </div>
    </div>
  </div>
</template>
