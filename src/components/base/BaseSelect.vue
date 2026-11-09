<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Select option...' },
  error: { type: String, default: '' },
  id: { type: String, default: () => `select-${Math.random().toString(36).substring(2, 9)}` }
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label small fw-semibold text-secondary">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="['form-select form-select-sm', { 'is-invalid': error }]"
    >
      <option value="" disabled selected>{{ placeholder }}</option>
      <option
        v-for="opt in options"
        :key="typeof opt === 'object' ? opt.value : opt"
        :value="typeof opt === 'object' ? opt.value : opt"
      >
        {{ typeof opt === 'object' ? opt.label : opt }}
      </option>
    </select>
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
  </div>
</template>