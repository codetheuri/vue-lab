<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  error: {
    type: String, 
    default: '' 
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substring(2, 9)}`
  }
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="['form-control form-control-sm', { 'is-invalid': error }]"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <div v-if="error" class="invalid-feedback">{{ error }}</div>
  </div>
</template>