<script setup>
/**
- TableFilters.vue
- 
- Reusable dropdown filter component for DataTable categorization.
- Supports passing dynamic options and emitting selections.
 */
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: 'Filter'
  },
  options: {
    type: Array,
    default: () => []
    // Example: [{ value: '', label: 'All' }, { value: 'Active', label: 'Active' }]
  },
  size: {
    type: String,
    default: 'sm'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  wrapperClass: {
    type: String,
    default: ''
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  
  <div :class="['d-flex align-items-center gap-2', wrapperClass]">
    <label v-if="label" class="small text-secondary mb-0 fw-medium text-nowrap">
      {{ label }}:
    </label>
    <select
      :class="['form-select', `form-select-${size}`]"
      :value="modelValue"
      :disabled="disabled"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option
        v-for="opt in options"
        :key="opt.value"
        :value="opt.value"
      >
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>