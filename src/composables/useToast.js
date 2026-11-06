import { ref } from 'vue'

const toasts = ref([])
const timeouts = new Map()

export function useToast() {
  const removeToast = (id) => {
    if (timeouts.has(id)) {
      clearTimeout(timeouts.get(id))
      timeouts.delete(id)
    }
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const pauseTimeout = (id) => {
    if (timeouts.has(id)) {
      clearTimeout(timeouts.get(id))
      timeouts.delete(id)
    }
  }

  const resumeTimeout = (id, duration) => {
    if (duration > 0 && !timeouts.has(id)) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, duration)
      timeouts.set(id, timer)
    }
  }

  const addToast = (messageOrOptions, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random()
    
    let toastConfig = {
      id,
      message: '',
      type: 'success',
      duration: 3500,
      dismissible: true,
      title: null,
      customIcon: null,
      pauseOnHover: true,
      ...(typeof messageOrOptions === 'object' && messageOrOptions !== null
        ? messageOrOptions
        : { message: messageOrOptions, type, duration })
    }
    
    toasts.value.push(toastConfig)

    if (toastConfig.duration > 0) {
      const timer = setTimeout(() => {
        removeToast(id)
      }, toastConfig.duration)
      timeouts.set(id, timer)
    }
  }

  const showSuccess = (options) => addToast(options, 'success')
  const showDanger = (options) => addToast(options, 'danger')
  const showInfo = (options) => addToast(options, 'info')

  return {
    toasts,
    addToast,
    removeToast,
    pauseTimeout,
    resumeTimeout,
    showSuccess,
    showDanger,
    showInfo
  }
}