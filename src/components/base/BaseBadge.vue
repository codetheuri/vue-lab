<script setup>
/**
 * BaseBadge.vue
 * 
 * Reusable badge component supporting subtle variants and pill borders.
 * Used for status indicators and categorical tags.
 */
defineProps({
  variant: {
    type: String,
    default: 'secondary' // primary, success, warning, danger, info, secondary
  },
  pill: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <span
    :class="[
      'badge',
      `bg-${variant}-subtle`,
      `text-${variant}`,
      `border border-${variant}-subtle`,
      { 'rounded-pill': pill }
    ]"
  >
    <slot />
  </span>
</template>

