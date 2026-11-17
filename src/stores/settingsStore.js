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

  // Export workspace backup as a timestamped JSON file
  const exportWorkspaceBackup = () => {
    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings: {
        workspaceName: workspaceName.value,
        currency: currency.value,
        lowStockThreshold: lowStockThreshold.value,
        defaultPageSize: defaultPageSize.value,
        enableAuditLog: enableAuditLog.value,
        compactTables: compactTables.value
      },
      products: JSON.parse(localStorage.getItem('products') || '[]'),
      employees: JSON.parse(localStorage.getItem('employees') || '[]'),
      activityLogs: JSON.parse(localStorage.getItem('activityLogs') || '[]')
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    
    const dateStr = new Date().toISOString().split('T')[0]
    downloadAnchor.setAttribute("download", `workspace-backup-${dateStr}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Restore workspace backup from uploaded JSON string content
  const restoreWorkspaceBackup = (fileContent) => {
    try {
      const parsed = JSON.parse(fileContent)
      
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid backup file format.')
      }
      if (!Array.isArray(parsed.products) || !Array.isArray(parsed.employees)) {
        throw new Error('Backup file is missing valid "products" or "employees" arrays.')
      }

      if (parsed.settings) {
        if (parsed.settings.workspaceName) workspaceName.value = parsed.settings.workspaceName
        if (parsed.settings.currency) currency.value = parsed.settings.currency
        if (parsed.settings.lowStockThreshold !== undefined) lowStockThreshold.value = Number(parsed.settings.lowStockThreshold)
        if (parsed.settings.defaultPageSize !== undefined) defaultPageSize.value = Number(parsed.settings.defaultPageSize)
        if (parsed.settings.compactTables !== undefined) compactTables.value = Boolean(parsed.settings.compactTables)
        if (parsed.settings.enableAuditLog !== undefined) enableAuditLog.value = Boolean(parsed.settings.enableAuditLog)
      }

      localStorage.setItem('products', JSON.stringify(parsed.products))
      localStorage.setItem('employees', JSON.stringify(parsed.employees))
      if (parsed.activityLogs) {
        localStorage.setItem('activityLogs', JSON.stringify(parsed.activityLogs))
      }

      return true
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  return {
    workspaceName,
    currency,
    lowStockThreshold,
    defaultPageSize,
    enableAuditLog,
    compactTables,
    resetSettings,
    exportWorkspaceBackup,
    restoreWorkspaceBackup
  }
})