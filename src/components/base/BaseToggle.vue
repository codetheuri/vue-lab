<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
    default: () => `toggle-${Math.random().toString(36).substring(2, 9)}`
  }
})

const emit = defineEmits(['update:modelValue'])

const onChange = (event) => {
  emit('update:modelValue', event.target.checked)
}
</script>

<template>
  <div class="d-flex align-items-start justify-content-between py-2">
    <div class="pe-3">
      <label :for="id" class="fw-semibold text-dark small mb-0 d-block" style="cursor: pointer;">
        {{ label }}
      </label>
      <p v-if="description" class="text-secondary small mb-0 mt-1" style="font-size: 0.8rem;">
        {{ description }}
      </p>
    </div>

    <div class="form-check form-switch fs-5 mb-0">
      <input
        :id="id"
        class="form-check-input"
        type="checkbox"
        role="switch"
        :checked="modelValue"
        :disabled="disabled"
        style="cursor: pointer;"
        @change="onChange"
      />
    </div>
  </div>
</template>