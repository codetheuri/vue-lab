<script setup>
/**
- TableSearch.vue
- 
- Reusable search bar for DataTable filtering.
- Emits 'update:modelValue' for two-way binding with search term.
 */
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search records...'
  },
  size: {
    type: String,
    default: 'sm'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  clearable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div :class="['input-group', `input-group-${size}`]">
    <span class="input-group-text bg-white border-end-0 text-secondary">
      <i class="bi bi-search"></i>
    </span>
    <input
      type="text"
      class="form-control border-start-0 ps-0"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      aria-label="Search records"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <!-- Optional Clear Button -->
    <button
      v-if="clearable && modelValue"
      type="button"
      class="btn btn-outline-secondary border-start-0 bg-white text-secondary"
      @click="$emit('update:modelValue', '')"
      title="Clear search"
    >
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>