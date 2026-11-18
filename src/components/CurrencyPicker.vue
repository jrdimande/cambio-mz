<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import CurrencyFlag from './CurrencyFlag.vue'

const props = defineProps({
  currencies: { type: Array, required: true },
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
})
const emit = defineEmits(['update:modelValue'])
const root = ref(null)
const trigger = ref(null)
const open = ref(false)
const selectedCurrency = computed(() => props.currencies.find((currency) => currency.code === props.modelValue))

async function closeMenu(restoreFocus = false) {
  open.value = false
  if (restoreFocus) {
    await nextTick()
    trigger.value?.focus()
  }
}

async function chooseCurrency(currency) {
  emit('update:modelValue', currency.code)
  await closeMenu(true)
}

function closeOnOutsideClick(event) {
  if (!root.value?.contains(event.target)) open.value = false
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
      @click="open = !open"
    >
      <CurrencyFlag :country-code="selectedCurrency?.countryCode" :country-name="selectedCurrency?.country" />
      <span class="picker-selected-code">{{ selectedCurrency?.code ?? '—' }}</span>
      <i class="bi bi-chevron-down picker-chevron" aria-hidden="true"></i>
    </button>
    <div v-if="open" class="currency-picker-menu" role="listbox" :aria-label="label">
      <button
        v-for="currency in currencies"
        :key="currency.code"
        class="currency-picker-option"
        :class="{ 'is-selected': currency.code === modelValue }"
        type="button"
        role="option"
        :aria-selected="currency.code === modelValue"
        @click="chooseCurrency(currency)"
      >
        <CurrencyFlag :country-code="currency.countryCode" :country-name="currency.country" />
        <span class="picker-option-copy"><strong>{{ currency.name }}</strong><small>{{ currency.code }}</small></span>
        <span class="picker-option-code">{{ currency.code }}</span>
      </button>
    </div>
  </div>
</template>
