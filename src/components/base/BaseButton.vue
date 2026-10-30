<script setup>
/**
 * BaseButton.vue
 * 
 * Reusable button component supporting Bootstrap variants, sizes, and states.
 * To be expanded in the next phase to demonstrate props, emits, and slots.
 */
defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, success, danger, outline-primary, etc.
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'button'
  }
})

defineEmits(['click'])
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn-${variant}`,
      size !== 'md' ? `btn-${size}` : '',
      'd-inline-flex align-items-center justify-content-center gap-2'
    ]"
    @click="$emit('click', $event)"
  >
    <span
      v-if="loading"
      class="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    ></span>
    <slot />
  </button>
</template>

