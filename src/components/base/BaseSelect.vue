<script setup>
defineProps({
  label: {
    type: String,
    default: ''
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true // Array of { value: '', label: '', disabled: false }
  },
  placeholder: {
    type: String,
    default: 'Select option...'
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-3">
    <label v-if="label" class="form-label fw-medium text-dark small">{{ label }}</label>
    <select
      :value="modelValue"
      :disabled="disabled"
      :class="['form-select', error ? 'is-invalid' : '']"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="" disabled selected>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
        :class="{ 'text-muted bg-light': option.disabled }"
      >
        {{ option.label }}
      </option>
    </select>
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
  </div>
</template>