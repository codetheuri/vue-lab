<script setup>
import { computed, watch } from 'vue'
import { useToast } from '../../composables/useToast'

const { toasts, removeToast, pauseTimeout, resumeTimeout } = useToast() 

const props = defineProps({
  position: {
    type: String,
    default: 'bottom-0 end-0'
  },
  maxToasts: {
    type: Number,
    default: 5
  },
  theme: {
    type: String,
    default: 'light' // 'light' or 'dark'
  }
})

const visibleToasts = computed(() => {
  return toasts.value.slice(-props.maxToasts)
})

watch(toasts, (newVal) => {
  console.log(' Toasts array updated in BaseToast:', newVal)
}, { deep: true })

const getToastConfig = (toast) => {
  const isDark = props.theme === 'dark'
  switch (toast.type) {
    case 'success':
      return {
        alertClass: isDark ? 'bg-success text-white border-success' : 'alert-success border-success-subtle text-success-emphasis bg-success-subtle',
        icon: isDark ? 'bi-check-circle-fill text-white' : 'bi-check-circle-fill text-success',
        closeClass: isDark ? 'btn-close-white' : ''
      }
    case 'danger':
      return {
        alertClass: isDark ? 'bg-danger text-white border-danger' : 'alert-danger border-danger-subtle text-danger-emphasis bg-danger-subtle',
        icon: isDark ? 'bi-exclamation-triangle-fill text-white' : 'bi-exclamation-triangle-fill text-danger',
        closeClass: isDark ? 'btn-close-white' : ''
      }
    case 'info':
    default:
      return {
        alertClass: isDark ? 'bg-dark text-white border-secondary' : 'alert-info border-info-subtle text-info-emphasis bg-info-subtle',
        icon: isDark ? 'bi-info-circle-fill text-white' : 'bi-info-circle-fill text-info',
        closeClass: isDark ? 'btn-close-white' : ''
      }
  }
}

</script>

<template>
  <Teleport to="body">
    <TransitionGroup 
      tag="div" 
      name="toast-list"
      class="toast-container position-fixed p-3" 
      :class="position"
      style="z-index: 1080;"
    >
      <div
        v-for="toast in visibleToasts"
        :key="toast.id"
        class="alert d-flex align-items-center shadow-sm mb-2 px-3 py-2 border"
        :class="getToastConfig(toast).alertClass"
        role="alert"
        style="min-width: 280px; max-width: 400px;"
        @mouseenter="pauseTimeout(toast.id)"
        @mouseleave="resumeTimeout(toast.id, toast.duration)"
      >
        <i :class="['bi me-2 fs-5', getToastConfig(toast).icon]"></i>
        <div class="flex-grow-1 small fw-medium">
          {{ toast.message }}
        </div>
        <button
          type="button"
          class="btn-close ms-2"
          :class="getToastConfig(toast).closeClass"
          aria-label="Close"
          @click="removeToast(toast.id)"
        ></button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}
.toast-list-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.toast-list-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>