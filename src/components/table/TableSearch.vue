<script setup>
/**
 * TableSearch.vue
 * 
 * Reusable search bar for DataTable filtering.
 * Emits 'update:modelValue' for two-way binding with search term.
 */
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search records...'
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="input-group input-group-sm">
    <span class="input-group-text bg-white border-end-0 text-secondary">
      <i class="bi bi-search"></i>
    </span>
    <input
      type="text"
      class="form-control border-start-0 ps-0"
      :value="modelValue"
      :placeholder="placeholder"
      aria-label="Search records"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

