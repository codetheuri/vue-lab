<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary' // primary, secondary, danger, outline-primary, outline-secondary, etc.
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  },
  text: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'button'
  },
  to: {
    type: [String, Object],
    default: null
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])
const router = useRouter()

const handleClick = (event) => {
  if (props.disabled || props.loading) return
  if (props.to) {
    router.push(props.to)
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :class="[
      'btn',
      `btn-${variant}`,
      size !== 'md' ? `btn-${size}` : '',
      'd-inline-flex',
      'align-items-center',
      'justify-content-center',
      'gap-2'
    ]"
    :disabled="disabled || loading"
    :title="title"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    
    <!-- Icon -->
    <i v-else-if="icon" :class="icon"></i>

    <!-- Button Text & Fallback Slot for flexibility -->
    <slot>
      <span v-if="text">{{ text }}</span>
    </slot>
  </button>
</template>
