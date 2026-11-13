import { simulateDelay } from './api'

const DEMO_ACCOUNTS = [
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

export const authService = {
  async login(email, password) {
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
  },

  async logout() {
    await simulateDelay(250)
    return { success: true }
  },

  async updateProfile(currentUser, { name, role }) {
    await simulateDelay(400)

    if (!currentUser) {
      throw new Error('No active user session found.')
    }

    return {
      ...currentUser,
      name: name?.trim() || currentUser.name,
      role: role || currentUser.role
    }
  }
}