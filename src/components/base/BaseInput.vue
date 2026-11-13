<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
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

const showPassword = ref(false)

// Toggle between 'password' and 'text' only when type is password
const inputType = computed(() => {
  if (props.type === 'password') {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<template>
  <div class="mb-3">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    
    <div :class="{ 'input-group input-group-sm': type === 'password' }">
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :class="['form-control form-control-sm', { 'is-invalid': error }]"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="btn btn-outline-secondary"
        @click="showPassword = !showPassword"
        tabindex="-1"
        :title="showPassword ? 'Hide password' : 'Show password'"
      >
        <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
      </button>
    </div>

    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
  </div>
</template>