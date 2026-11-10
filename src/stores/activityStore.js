import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from './authStore'

export const useActivityStore = defineStore('activity', () => {
  const saved = localStorage.getItem('app_activity_logs')
  const logs = ref(saved ? JSON.parse(saved) : [
    {
      id: Date.now(),
      userName: 'System Administrator',
      userRole: 'Administrator',
      action: 'System Initialized',
      details: 'Vue-lab session started successfully.',
      variant: 'success',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Persist to localStorage on change
  watch(logs, (newVal) => {
    localStorage.setItem('app_activity_logs', JSON.stringify(newVal))
  }, { deep: true })

  // Log Action method capturing current user from authStore
  const logAction = (action, details, variant = 'info') => {
    const authStore = useAuthStore()
    const currentUser = authStore.user || { name: 'Guest User', role: 'Viewer' }

    const newLog = {
      id: Date.now(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      variant,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    logs.value.unshift(newLog)

    // Keep only the most recent 15 logs
    if (logs.value.length > 15) {
      logs.value = logs.value.slice(0, 15)
    }
  }

  const clearLogs = () => {
    logs.value = []
  }

  return {
    logs,
    logAction,
    clearLogs
  }
})