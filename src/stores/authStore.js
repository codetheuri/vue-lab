import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useActivityStore } from './activityStore'

export const useAuthStore = defineStore('auth', () => {
  // Load initial user from localStorage if present
  const storedUser = localStorage.getItem('app_auth_user')
  const user = ref(storedUser ? JSON.parse(storedUser) : null)

  // Computed Properties
  const isAuthenticated = computed(() => !!user.value)
  
  const isAdmin = computed(() => user.value?.role === 'Admin')

  const userInitials = computed(() => {
    if (!user.value?.name) return 'U'
    const parts = user.value.name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return parts[0].substring(0, 2).toUpperCase()
  })

  // Actions
  const login = (email, password) => {
    // Demo accounts check
    const demoAccounts = [
      {
        email: 'admin@company.com',
        password: 'admin123',
        name: 'Alex Morgan',
        role: 'Admin'
      },
      {
        email: 'staff@company.com',
        password: 'staff123',
        name: 'Sarah Jenkins',
        role: 'Viewer'
      }
    ]

    const found = demoAccounts.find(
      acc => acc.email === email.trim() && acc.password === password
    )

    if (found) {
      const userData = {
        name: found.name,
        email: found.email,
        role: found.role
      }
      user.value = userData
      localStorage.setItem('app_auth_user', JSON.stringify(userData))

      const activityStore = useActivityStore()
      activityStore.logAction(
        'User Sign In',
        `${userData.name} logged into the system as ${userData.role}.`,
        'info'
      )
      return true
    }

    return false
  }

  const logout = () => {
    if (user.value) {
      const activityStore = useActivityStore()
      activityStore.logAction(
        'User Sign Out',
        `${user.value.name} logged out of the console.`,
        'secondary'
      )
    }
    user.value = null
    localStorage.removeItem('app_auth_user')
  }

  const updateProfile = ({ name, role }) => {
    if (!user.value) return
    const oldRole = user.value.role
    const updatedUser = {
      ...user.value,
      name: name.trim() || user.value.name,
      role: role || user.value.role
    }

    user.value = updatedUser
    localStorage.setItem('app_auth_user', JSON.stringify(updatedUser))

    const activityStore = useActivityStore()
    activityStore.logAction(
      'Profile Updated',
      `Updated profile to "${updatedUser.name}" with role "${updatedUser.role}".`,
      oldRole !== updatedUser.role ? 'warning' : 'info'
    )
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    userInitials,
    login,
    logout,
    updateProfile
  }
})