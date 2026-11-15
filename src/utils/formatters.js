import { useSettingsStore } from '../stores/settingsStore'

export const formatCurrency = (amount) => {
  const settingsStore = useSettingsStore()
  const currency = settingsStore.currency || 'USD'
  const num = Number(amount || 0)

  const currencyMap = {
    USD: { locale: 'en-US', currency: 'USD' },
    KES: { locale: 'en-KE', currency: 'KES' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    GBP: { locale: 'en-GB', currency: 'GBP' }
  }

  const config = currencyMap[currency] || currencyMap.USD

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  } catch (e) {
    // Fallback if formatting fails
    const symbols = { USD: '$', KES: 'KSh ', EUR: '€', GBP: '£' }
    return `${symbols[currency] || '$'}${num.toFixed(2)}`
  }
}

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const getInitials = (name) => {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}