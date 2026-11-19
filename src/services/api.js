import { useAuthStore } from '../stores/authStore'
import { useToast } from '../composables/useToast'
import router from '../router'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/+$/, '')
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT) || 10000

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

const toFormData = (payload) => {
  if (payload instanceof FormData) return payload

  const formData = new FormData()
  if (payload && typeof payload === 'object') {
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item))
      } else {
        formData.append(key, value)
      }
    })
  }
  return formData
}

const request = async (endpoint, options = {}) => {
  const {
    params,
    body,
    isMultipart = false,
    timeout = DEFAULT_TIMEOUT_MS,
    headers = {},
    ...customOptions
  } = options

  const token = localStorage.getItem('vue_lab_token')

  const finalHeaders = {
    ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers
  }

  const queryString = buildQueryString(params)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${API_BASE_URL}${cleanEndpoint}${queryString}`

  const controller = new AbortController()
  const timeoutLimit = Number(timeout) || DEFAULT_TIMEOUT_MS
  let didTimeout = false

  const timer = setTimeout(() => {
    didTimeout = true
    controller.abort()
  }, timeoutLimit)

  const resolvedBody = body === undefined
    ? undefined
    : isMultipart
      ? toFormData(body)
      : JSON.stringify(body)

  const config = {
    ...customOptions,
    headers: finalHeaders,
    signal: controller.signal,
    ...(resolvedBody !== undefined ? { body: resolvedBody } : {})
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

      // 401 Unauthorized: Missing/expired token or invalid credentials
      if (response.status === 401) {
        authStore.logoutLocally?.() || localStorage.removeItem('vue_lab_token')
        if (router.currentRoute.value.path !== '/login') {
          showWarning('Your session has expired. Please sign in again.')
          router.push('/login')
        }
      }

      // 403 Forbidden: Role lacks permission for destructive action
      if (response.status === 403) {
        showDanger('Access denied. You lack the required permissions for this action.')
      }

      // Create a structured error object for 422 validation or general handling
      const error = new Error(data.message || 'API request failed')
      error.status = response.status
      error.errors = data.errors || {}
      throw error
    }

    return data
  } catch (err) {
    // If it's already our structured error, rethrow it
    if (err.status) throw err

    // Timeout via AbortController
    if (err?.name === 'AbortError' && didTimeout) {
      const timeoutError = new Error(`Request timed out after ${timeoutLimit}ms.`)
      timeoutError.status = 408
      timeoutError.code = 'ETIMEDOUT'
      throw timeoutError
    }

    // Network or parsing errors
    const networkError = new Error(err.message || 'Network connection error')
    networkError.status = 0
    throw networkError
  } finally {
    clearTimeout(timer)
  }
}

export const api = {
  get: (endpoint, params = {}, options = {}) =>
    request(endpoint, { method: 'GET', params, ...options }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { method: 'POST', body, ...options }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { method: 'PUT', body, ...options }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { method: 'PATCH', body, ...options }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { method: 'DELETE', ...options }),

  upload: (endpoint, formDataOrFields, options = {}) =>
    request(endpoint, {
      method: 'POST',
      body: formDataOrFields,
      isMultipart: true,
      ...options
    })
}