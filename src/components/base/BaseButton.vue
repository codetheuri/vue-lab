<script>
export default {
  inheritAttrs: false
}
</script>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  variant: {
    type: String,
    default: 'outline-primary' 
  },
  icon: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'sm' 
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
  },
  text: {
    type: String,
    default: ''
  },
  to: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])


const handleClick = (event) => {
  if (props.to) {
    router.push(props.to)
  }
  emit('click', event)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    v-bind="$attrs"
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      'shadow-sm',
      'd-inline-flex align-items-center justify-content-center gap-2'
    ]"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="spinner-border spinner-border-sm"
      role="status"
      aria-hidden="true"
    ></span>
    <i v-if="icon" :class="icon"></i>
    
    <span v-if="text">{{ text }}</span>
    
    <slot />
  </button>
</template>