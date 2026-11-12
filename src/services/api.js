const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('vue_lab_token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${response.statusText}`)
  }

  return response.json()
}