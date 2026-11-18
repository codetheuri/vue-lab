import { simulateDelay, api } from './api'

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'

const DEMO_ACCOUNTS = [
  {
    email: 'admin@company.com',
    password: 'admin123',
    name: 'Alex Morgan',
    role: 'Admin'
  },
  {
    email: 'manager@company.com',
    password: 'manager123',
    name: 'Jordan Lee',
    role: 'Manager'
  },
  {
    email: 'staff@company.com',
    password: 'staff123',
    name: 'Sarah Jenkins',
    role: 'Viewer'
  }
]

export const authService = {
  async login(email, password) {
    if (USE_MOCK) {
      await simulateDelay(500)

      const found = DEMO_ACCOUNTS.find(
        acc => acc.email.toLowerCase() === String(email).trim().toLowerCase() && acc.password === password
      )

      if (!found) {
        throw new Error('Invalid email or password.')
      }

      const user = {
        name: found.name,
        email: found.email,
        role: found.role
      }
      const token = `vue_lab_tok_${found.role.toLowerCase()}_${Date.now()}`

      return { user, token }
    } else {
      return await api.post('/auth/login', { email, password })
    }
  },

  async logout() {
    if (USE_MOCK) {
      await simulateDelay(250)
      return { success: true }
    } else {
      return await api.post('/auth/logout')
    }
  },

  async updateProfile(currentUser, { name, role }) {
    if (USE_MOCK) {
      await simulateDelay(400)

      if (!currentUser) {
        throw new Error('No active user session found.')
      }

      return {
        ...currentUser,
        name: name?.trim() || currentUser.name,
        role: role || currentUser.role
      }
    } else {
      return await api.put('/auth/profile', { name, role })
    }
  }
}