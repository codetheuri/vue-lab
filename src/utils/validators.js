export const isRequired = (value, message = 'This field is required.') => {
  if (value === null || value === undefined) return message
  if (typeof value === 'string' && value.trim() === '') return message
  return ''
}

export const isEmail = (value, message = 'Must be a valid email address containing "@".') => {
  const str = String(value ?? '').trim()
  if (!str) return ''
  return str.includes('@') ? '' : message
}

export const minLength = (value, min, message) => {
  const str = String(value ?? '')
  if (!str) return ''
  const limit = Number(min) || 1
  return str.length >= limit
    ? ''
    : (message || `Must be at least ${limit} characters.`)
}

export const isPositiveNumber = (
  value,
  { allowZero = false, message } = {}
) => {
  if (value === '' || value === null || value === undefined) {
    return 'A valid number is required.'
  }
  const num = Number(value)
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return 'Must be a valid number.'
  }
  if (allowZero) {
    return num >= 0 ? '' : (message || 'Must be 0 or more.')
  }
  return num > 0 ? '' : (message || 'Must be greater than 0.')
}

export const applyServerValidationErrors = (err, targetErrorsRef) => {
  if (!err || err.status !== 422 || !err.errors || typeof err.errors !== 'object') {
    return false
  }

  const current = targetErrorsRef.value || {}
  const next = {}

  for (const key of Object.keys(current)) {
    const raw = err.errors[key]
    next[key] = Array.isArray(raw) ? String(raw[0] || '') : String(raw || '')
  }

  for (const [key, raw] of Object.entries(err.errors)) {
    if (!(key in next)) {
      next[key] = Array.isArray(raw) ? String(raw[0] || '') : String(raw || '')
    }
  }

  targetErrorsRef.value = next
  return true
}