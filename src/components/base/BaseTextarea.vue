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
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: [Number, String],
    default: 3
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
    <textarea
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      class="form-control"
      :class="{ 'is-invalid': error }"
    ></textarea>
    <div v-if="error" class="invalid-feedback">
      {{ error }}
    </div>
  </div>
</template>