import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
      return true
    }

    return false
  }

  const logout = () => {
    user.value = null
    localStorage.removeItem('app_auth_user')
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    userInitials,
    login,
    logout
  }
})