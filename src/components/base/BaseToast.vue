
<script setup>
import { useToast } from '../../composables/useToast'

const { toasts, removeToast } = useToast()
// Debug watcher
import { watch } from 'vue'
watch(toasts, (newVal) => {
  console.log('🔥 Toasts array updated in BaseToast:', newVal)
}, { deep: true })
// Map toast types to Bootstrap alert classes and Bootstrap Icons
const getToastConfig = (type) => {
  switch (type) {
    case 'success':
      return {
        alertClass: 'alert-success border-success-subtle text-success-emphasis bg-success-subtle',
        icon: 'bi-check-circle-fill text-success'
      }
    case 'danger':
      return {
        alertClass: 'alert-danger border-danger-subtle text-danger-emphasis bg-danger-subtle',
        icon: 'bi-exclamation-triangle-fill text-danger'
      }
    case 'info':
    default:
      return {
        alertClass: 'alert-info border-info-subtle text-info-emphasis bg-info-subtle',
        icon: 'bi-info-circle-fill text-info'
      }
  }
}
</script>

<template>
  <Teleport to="body">
    <TransitionGroup 
      tag="div" 
      name="toast-list"
      class="toast-container position-fixed bottom-0 end-0 p-3" 
      style="z-index: 1080;"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="alert d-flex align-items-center shadow-sm mb-2 px-3 py-2 border"
        :class="getToastConfig(toast.type).alertClass"
        role="alert"
        style="min-width: 280px; max-width: 400px;"
      >
        <i :class="['bi me-2 fs-5', getToastConfig(toast.type).icon]"></i>
        <div class="flex-grow-1 small fw-medium">
          {{ toast.message }}
        </div>
        <button
          type="button"
          class="btn-close ms-2"
          aria-label="Close"
          @click="removeToast(toast.id)"
        ></button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>
<style scoped>
/* Smooth slide & fade transition for toasts */
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