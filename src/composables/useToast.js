
import { ref } from 'vue'

// Singleton state shared across the entire app
const toasts = ref([])

export function useToast() {
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type }
    
    toasts.value.push(toast)

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const showSuccess = (message) => addToast(message, 'success')
  const showDanger = (message) => addToast(message, 'danger')
  const showInfo = (message) => addToast(message, 'info')

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showDanger,
    showInfo
  }
}