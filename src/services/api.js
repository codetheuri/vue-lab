import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import router from '../router'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.company.com/v1'

// Helper for simulating async latency in mock mode
export const simulateDelay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms))

// Helper to build query strings from objects (e.g. { page: 1, search: 'alex' } -> ?page=1&search=alex)
const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return ''
  const filtered = Object.entries(params).filter(([_, val]) => val !== undefined && val !== null && val !== '')
  if (filtered.length === 0) return ''
  const query = new URLSearchParams(filtered).toString()
  return query ? `?${query}` : ''
}

const request = async (endpoint, options = {}) => {
  const { params, body, headers = {}, ...customOptions } = options
  const token = localStorage.getItem('vue_lab_token')

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  }

  const queryString = buildQueryString(params)
  const url = `${API_BASE_URL}${endpoint}${queryString}`

  const config = {
    ...customOptions,
    headers: finalHeaders,
    ...(body ? { body: JSON.stringify(body) } : {})
  }

  try {
    const response = await fetch(url, config)

    // Handle No Content responses gracefully
    if (response.status === 204) {
      return null
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      const authStore = useAuthStore()
      const { showWarning, showDanger } = useToast()

      // 401 Unauthorized: Session Expired
      if (response.status === 401) {
        authStore.logoutLocally?.() || localStorage.removeItem('vue_lab_token')
        showWarning('Your session has expired. Please sign in again.')
        router.push('/login')
      }

      // 403 Forbidden: Lacks permission
      if (response.status === 403) {
        showDanger('Access denied. You lack the required permissions for this action.')
      }

      // Create a structured error object for validation/handling
      const error = new Error(data.message || 'API request failed')
      error.status = response.status
      error.errors = data.errors || {} // Attach 422 validation errors
      throw error
    }

    return data
  } catch (err) {
    // If it's already our structured error, rethrow it
    if (err.status) throw err

    // Network or parsing errors
    const networkError = new Error(err.message || 'Network connection error')
    networkError.status = 0
    throw networkError
  }
}

export const api = {
  get: (endpoint, params = {}, options = {}) => request(endpoint, { method: 'GET', params, ...options }),
  post: (endpoint, body, options = {}) => request(endpoint, { method: 'POST', body, ...options }),
  put: (endpoint, body, options = {}) => request(endpoint, { method: 'PUT', body, ...options }),
  patch: (endpoint, body, options = {}) => request(endpoint, { method: 'PATCH', body, ...options }),
  delete: (endpoint, options = {}) => request(endpoint, { method: 'DELETE', ...options })
}