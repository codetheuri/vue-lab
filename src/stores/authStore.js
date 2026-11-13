import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useActivityStore } from './activityStore'
import { authService } from '../services/authService'
import { getInitials } from '../utils/formatters'

export const useAuthStore = defineStore('auth', () => {
  // Load initial user and token from localStorage if present
  const storedUser = localStorage.getItem('app_auth_user')
  const storedToken = localStorage.getItem('vue_lab_token')

  const user = ref(storedUser ? JSON.parse(storedUser) : null)
  const token = ref(storedToken || null)
  const loading = ref(false)

  // Computed Properties
  const isAuthenticated = computed(() => !!user.value && !!token.value)

  const isAdmin = computed(() => user.value?.role === 'Admin')

  const userInitials = computed(() => getInitials(user.value?.name))

  // Actions
  const login = async (email, password) => {
    loading.value = true
    try {
      const { user: userData, token: authToken } = await authService.login(email, password)

      user.value = userData
      token.value = authToken
      localStorage.setItem('app_auth_user', JSON.stringify(userData))
      localStorage.setItem('vue_lab_token', authToken)

      const activityStore = useActivityStore()
      activityStore.logAction(
        'User Sign In',
        `${userData.name} logged into the system as ${userData.role}.`,
        'info'
      )
      return true
    } catch {
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      const currentName = user.value?.name
      await authService.logout()

      if (currentName) {
        const activityStore = useActivityStore()
        activityStore.logAction(
          'User Sign Out',
          `${currentName} logged out of the console.`,
          'secondary'
        )
      }
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('app_auth_user')
      localStorage.removeItem('vue_lab_token')
      loading.value = false
    }
  }

  const updateProfile = async (updates) => {
    if (!user.value) return
    loading.value = true
    try {
      const oldRole = user.value.role
      const updatedUser = await authService.updateProfile(user.value, updates)

      user.value = updatedUser
      localStorage.setItem('app_auth_user', JSON.stringify(updatedUser))

      const activityStore = useActivityStore()
      activityStore.logAction(
        'Profile Updated',
        `Updated profile to "${updatedUser.name}" with role "${updatedUser.role}".`,
        oldRole !== updatedUser.role ? 'warning' : 'info'
      )
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    userInitials,
    login,
    logout,
    updateProfile
  }
})