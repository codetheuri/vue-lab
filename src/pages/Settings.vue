<script setup>
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settingsStore'
import { useToast } from '../composables/useToast'
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseToggle from '../components/base/BaseToggle.vue'
import BaseButton from '../components/base/BaseButton.vue'

const settingsStore = useSettingsStore()
const {
  workspaceName,
  currency,
  lowStockThreshold,
  defaultPageSize,
  enableAuditLog,
  compactTables
} = storeToRefs(settingsStore)

const { showInfo, showSuccess } = useToast()

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