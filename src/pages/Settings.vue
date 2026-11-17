<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settingsStore'
import { useAuthStore } from '../stores/authStore'
import { useActivityStore } from '../stores/activityStore'
import { useToast } from '../composables/useToast'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseToggle from '../components/base/BaseToggle.vue'
import BaseButton from '../components/base/BaseButton.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const activityStore = useActivityStore()

const {
  workspaceName,
  currency,
  lowStockThreshold,
  defaultPageSize,
  enableAuditLog,
  compactTables
} = storeToRefs(settingsStore)

const { showInfo, showSuccess, showDanger } = useToast()

const currencyOptions = [
  { value: 'USD', label: 'USD ($) — US Dollar' },
  { value: 'KES', label: 'KES (KSh) — Kenyan Shilling' },
  { value: 'EUR', label: 'EUR (€) — Euro' },
  { value: 'GBP', label: 'GBP (£) — British Pound' }
]

const pageSizeOptions = [
  { value: 5, label: '5 rows per page' },
  { value: 10, label: '10 rows per page' },
  { value: 20, label: '20 rows per page' }
]

const handleReset = () => {
  settingsStore.resetSettings()
  showInfo('System settings restored to default values.')
}

const handleSaveFeedback = () => {
  showSuccess('All settings are auto-saved and active across the workspace!')
}

// Backup & Restore State & Handlers
const fileInputRef = ref(null)
const selectedFile = ref(null)

const handleExportBackup = () => {
  settingsStore.exportWorkspaceBackup()
  showSuccess('Workspace backup exported successfully!')
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleRestoreBackup = () => {
  if (!selectedFile.value) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target.result
      settingsStore.restoreWorkspaceBackup(content)

      // Log action in activity store
      activityStore.logAction('Workspace Restored', 'Restored workspace state from uploaded JSON backup file.', 'warning')

      showSuccess('Workspace successfully restored from backup!')
      selectedFile.value = null
      if (fileInputRef.value) fileInputRef.value.value = ''

      // Reload app to apply all restored store states
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err) {
      showDanger(`Restore failed: ${err.message}`)
    }
  }
  reader.readAsText(selectedFile.value)
}
</script>

<template>
  <div class="settings-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">System Settings</h1>
        <p class="text-secondary small mb-0">Configure global workspace branding, currency formatting, inventory thresholds, and table preferences.</p>
      </div>

      <div class="d-flex gap-2">
        <BaseButton
          variant="outline-danger"
          size="md"
          text="Reset to Defaults"
          icon="bi bi-arrow-counterclockwise"
          @click="handleReset"
        />
        <BaseButton
          variant="primary"
          size="md"
          text="Apply & Verify"
          icon="bi bi-check2-circle"
          @click="handleSaveFeedback"
        />
      </div>
    </div>

    <!-- Data Backup & Restore Card (Admin Only) -->
    <div v-if="authStore.isAdmin" class="card shadow-sm border mb-4">
      <div class="card-header bg-white py-3 px-4 border-bottom">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-cloud-arrow-down text-primary"></i>
          <span class="fw-semibold text-dark">Data Backup & Restore</span>
        </div>
        <small class="text-secondary">Export your complete workspace state or restore from a previous JSON backup.</small>
      </div>
      <div class="card-body p-4">
        <div class="row g-4 align-items-center">
          <!-- Export Backup -->
          <div class="col-12 col-md-6 border-end-md">
            <h6 class="fw-semibold text-dark mb-1">Export Backup</h6>
            <p class="text-secondary small mb-3">
              Download a single JSON file containing all products, employees, activity logs, and system settings.
            </p>
            <BaseButton
              variant="outline-primary"
              size="sm"
              text="Download Workspace Backup (JSON)"
              icon="bi bi-download"
              @click="handleExportBackup"
            />
          </div>

          <!-- Restore Backup -->
          <div class="col-12 col-md-6">
            <h6 class="fw-semibold text-dark mb-1">Restore Backup</h6>
            <p class="text-secondary small mb-3">
              Upload a previously exported JSON backup file to overwrite current workspace data.
            </p>
            <div class="input-group input-group-sm">
              <input
                type="file"
                class="form-control"
                accept=".json"
                ref="fileInputRef"
                @change="handleFileChange"
              />
              <BaseButton
                variant="danger"
                size="sm"
                text="Restore Data"
                icon="bi bi-cloud-arrow-up"
                :disabled="!selectedFile"
                @click="handleRestoreBackup"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- General & Localization -->
      <div class="col-lg-6">
        <div class="card shadow-sm border h-100">
          <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-sliders text-primary fs-5"></i>
            <span class="fw-semibold text-dark">Workspace & Localization</span>
          </div>
          <div class="card-body p-4 vstack gap-3">
            <BaseInput
              label="Workspace / Company Name"
              v-model="workspaceName"
              placeholder="e.g. Vue Component Lab"
            />
            <small class="text-muted d-block -mt-2" style="font-size: 0.78rem;">
              Updates the sidebar brand header and browser tab title immediately.
            </small>

            <BaseSelect
              label="Default Display Currency"
              v-model="currency"
              :options="currencyOptions"
            />

            <BaseInput
              label="Low Stock Alert Threshold (Units)"
              type="number"
              v-model.number="lowStockThreshold"
              placeholder="10"
            />
            <small class="text-muted d-block" style="font-size: 0.78rem;">
              Products with stock strictly below <strong>{{ lowStockThreshold }}</strong> units are flagged as Low Stock across tables, dashboards, and notification bells.
            </small>
          </div>
        </div>
      </div>

      <!-- Data Tables & System Behavior -->
      <div class="col-lg-6">
        <div class="card shadow-sm border h-100">
          <div class="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center gap-2">
            <i class="bi bi-toggles text-primary fs-5"></i>
            <span class="fw-semibold text-dark">Tables & System Behavior</span>
          </div>
          <div class="card-body p-4 vstack gap-3">
            <BaseSelect
              label="Default Table Page Size"
              v-model.number="defaultPageSize"
              :options="pageSizeOptions"
            />

            <hr class="my-2 text-secondary opacity-25" />

            <BaseToggle
              v-model="enableAuditLog"
              label="Enable Activity Audit Logging"
              description="Record create, update, delete, and equipment allocation events in the system audit trail."
            />

            <hr class="my-2 text-secondary opacity-25" />

            <BaseToggle
              v-model="compactTables"
              label="Compact Table Rows"
              description="Apply tighter vertical padding (table-sm) across all data tables for higher information density."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>