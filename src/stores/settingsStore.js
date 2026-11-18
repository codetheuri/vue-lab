import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useProductStore } from './productStore'
import { useEmployeeStore } from './employeeStore'
import { useActivityStore } from './activityStore'

const STORAGE_KEY = 'vue_lab_system_settings'

const DEFAULT_SETTINGS = {
  workspaceName: 'Vue Component Lab',
  currency: 'USD',
  lowStockThreshold: 10,
  defaultPageSize: 10,
  enableAuditLog: true,
  compactTables: false,
  darkMode: false
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
  const darkMode = ref(Boolean(initial.darkMode))

  // Apply Bootstrap 5.3 theme attribute immediately and whenever darkMode toggles
  watch(
    darkMode,
    (isDark) => {
      document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')
    },
    { immediate: true }
  )

  // Persist automatically whenever any setting changes
  watch(
    [workspaceName, currency, lowStockThreshold, defaultPageSize, enableAuditLog, compactTables, darkMode],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          workspaceName: workspaceName.value,
          currency: currency.value,
          lowStockThreshold: Number(lowStockThreshold.value) || 0,
          defaultPageSize: Number(defaultPageSize.value) || 10,
          enableAuditLog: enableAuditLog.value,
          compactTables: compactTables.value,
          darkMode: darkMode.value
        })
      )
    },
    { deep: true }
  )

  const toggleDarkMode = () => {
    darkMode.value = !darkMode.value
  }

  const resetSettings = () => {
    workspaceName.value = DEFAULT_SETTINGS.workspaceName
    currency.value = DEFAULT_SETTINGS.currency
    lowStockThreshold.value = DEFAULT_SETTINGS.lowStockThreshold
    defaultPageSize.value = DEFAULT_SETTINGS.defaultPageSize
    enableAuditLog.value = DEFAULT_SETTINGS.enableAuditLog
    compactTables.value = DEFAULT_SETTINGS.compactTables
    darkMode.value = DEFAULT_SETTINGS.darkMode
  }

  // Export workspace backup by pulling directly from Pinia stores
  const exportWorkspaceBackup = () => {
    const productStore = useProductStore()
    const employeeStore = useEmployeeStore()
    const activityStore = useActivityStore()

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      settings: {
        workspaceName: workspaceName.value,
        currency: currency.value,
        lowStockThreshold: lowStockThreshold.value,
        defaultPageSize: defaultPageSize.value,
        enableAuditLog: enableAuditLog.value,
        compactTables: compactTables.value,
        darkMode: darkMode.value
      },
      products: productStore.products || [],
      employees: employeeStore.employees || [],
      activityLogs: activityStore.logs || []
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

  // Restore workspace backup by updating Pinia stores and services directly
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
        if (parsed.settings.darkMode !== undefined) darkMode.value = Boolean(parsed.settings.darkMode)
      }

      const productStore = useProductStore()
      const employeeStore = useEmployeeStore()
      const activityStore = useActivityStore()

      productStore.products = parsed.products
      if (typeof productStore.syncProducts === 'function') {
        productStore.syncProducts()
      } else {
        localStorage.setItem('vue_lab_products', JSON.stringify(parsed.products))
      }

      employeeStore.employees = parsed.employees
      if (typeof employeeStore.syncAll === 'function') {
        employeeStore.syncAll(parsed.employees)
      } else {
        localStorage.setItem('vue_lab_employees', JSON.stringify(parsed.employees))
      }

      if (parsed.activityLogs && Array.isArray(parsed.activityLogs)) {
        activityStore.logs = parsed.activityLogs
        if (typeof activityStore.syncLogs === 'function') {
          activityStore.syncLogs()
        } else {
          localStorage.setItem('vue_lab_activity_logs', JSON.stringify(parsed.activityLogs))
        }
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
    darkMode,
    toggleDarkMode,
    resetSettings,
    exportWorkspaceBackup,
    restoreWorkspaceBackup
  }
})