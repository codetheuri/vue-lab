import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

const STORAGE_KEY = 'vue_lab_system_settings'

const DEFAULT_SETTINGS = {
  workspaceName: 'Vue Component Lab',
  currency: 'USD',
  lowStockThreshold: 10,
  defaultPageSize: 10,
  enableAuditLog: true,
  compactTables: false
}

export const useSettingsStore = defineStore('settings', () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  const initial = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS }

  const workspaceName = ref(initial.workspaceName)
  const currency = ref(initial.currency)
  const lowStockThreshold = ref(Number(initial.lowStockThreshold))
  const defaultPageSize = ref(Number(initial.defaultPageSize))
  const enableAuditLog = ref(Boolean(initial.enableAuditLog))
  const compactTables = ref(Boolean(initial.compactTables))

  // Persist automatically whenever any setting changes
  watch(
    [workspaceName, currency, lowStockThreshold, defaultPageSize, enableAuditLog, compactTables],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workspaceName: workspaceName.value,
          currency: currency.value,
          lowStockThreshold: Number(lowStockThreshold.value) || 0,
          defaultPageSize: Number(defaultPageSize.value) || 10,
          enableAuditLog: enableAuditLog.value,
          compactTables: compactTables.value
        })
      )
    },
    { deep: true }
  )

  const resetSettings = () => {
    workspaceName.value = DEFAULT_SETTINGS.workspaceName
    currency.value = DEFAULT_SETTINGS.currency
    lowStockThreshold.value = DEFAULT_SETTINGS.lowStockThreshold
    defaultPageSize.value = DEFAULT_SETTINGS.defaultPageSize
    enableAuditLog.value = DEFAULT_SETTINGS.enableAuditLog
    compactTables.value = DEFAULT_SETTINGS.compactTables
  }

  return {
    workspaceName,
    currency,
    lowStockThreshold,
    defaultPageSize,
    enableAuditLog,
    compactTables,
    resetSettings
  }
})