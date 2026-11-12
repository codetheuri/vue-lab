<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useActivityStore } from '../stores/activityStore'
import { useDataTable } from '../composables/useDataTable'
import { useCsvExport } from '../composables/useCsvExport'
import { useToast } from '../composables/useToast'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import BaseModal from '../components/base/BaseModal.vue'

const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)
const { exportToCsv } = useCsvExport()
const { showSuccess, showDanger, showInfo } = useToast()

// Normalize activities to ensure search and filters work smoothly
const normalizedActivities = computed(() => {
  const list = activities.value || []
  return list.map(item => ({
    id: item.id || Math.random(),
    title: item.title || item.action || 'System Action',
    description: item.description || item.details || 'No details provided.',
    variant: item.variant || item.type || 'info',
    timestamp: item.timestamp || item.time || new Date().toLocaleString()
  }))
})

// Reusable table composable (search, filtering by variant/department, sort, pagination)
const {
  searchQuery,
  selectedCategoryOrDept: selectedVariant,
  currentPage,
  itemsPerPage,
  sortKey,
  sortOrder,
  hasActiveFilters,
  handleSort,
  clearAllFilters,
  filterAndSortItems,
  paginate
} = useDataTable(normalizedActivities)

const variantOptions = [
  { value: '', label: 'All Variants' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'danger', label: 'Danger' }
]

const filteredLogs = computed(() => {
  return filterAndSortItems(['title', 'description', 'timestamp'])
})

const paginatedLogs = computed(() => {
  return paginate(filteredLogs.value)
})

const tableColumns = [
  { key: 'variant', label: 'Level', sortable: true, class: 'ps-4' },
  { key: 'title', label: 'Action / Event', sortable: true },
  { key: 'description', label: 'Details', sortable: false },
  { key: 'timestamp', label: 'Timestamp', sortable: true },
  { key: 'actions', label: 'Action', sortable: false }
]

const exportToCSV = () => {
  if (!filteredLogs.value.length) {
    showDanger('No activity logs available to export.')
    return
  }
  const headers = ['id', 'title', 'description', 'variant', 'timestamp']
  const success = exportToCsv(filteredLogs.value, headers, 'activity_audit_logs.csv')
  if (success) {
    showSuccess('Audit logs exported to CSV successfully!')
  }
}

// Clear logs state
const isClearModalOpen = ref(false)

const confirmClearLogs = () => {
  if (normalizedActivities.value.length === 0) {
    showInfo('Audit log history is already empty.')
    return
  }
  isClearModalOpen.value = true
}

const executeClearLogs = () => {
  activityStore.activities = []
  localStorage.setItem('vue_lab_activities', JSON.stringify([]))
  showDanger('System activity log history cleared.')
  isClearModalOpen.value = false
}

const deleteSingleLog = (id) => {
  activityStore.activities = (activityStore.activities || []).filter(a => a.id !== id)
  localStorage.setItem('vue_lab_activities', JSON.stringify(activityStore.activities))
  showInfo('Log entry removed.')
}
</script>

<template>
  <div class="activity-log-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">System Activity Audit Log</h1>
        <p class="text-secondary small mb-0">Track administrative changes, system events, and data transactions across the platform.</p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <BaseButton
          v-if="hasActiveFilters"
          variant="outline-secondary"
          size="md"
          text="Clear Filters"
          icon="bi bi-x-circle"
          @click="clearAllFilters"
        />
        <BaseButton
          variant="outline-secondary"
          size="md"
          text="Export CSV"
          icon="bi bi-download"
          @click="exportToCSV"
        />
        <BaseButton
          variant="outline-danger"
          size="md"
          text="Clear All Logs"
          icon="bi bi-trash3"
          @click="confirmClearLogs"
        />
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-shield-check text-primary"></i>
          <span class="fw-semibold text-dark">Audit Trail Records</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            {{ filteredLogs.length }} Events
          </span>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-3">
          <TableFilters
            v-model="selectedVariant"
            label="Badge Variant"
            :options="variantOptions"
          />

          <div style="max-width: 250px; width: 100%;">
            <TableSearch
              v-model="searchQuery"
              placeholder="Search audit logs..."
              clearable
            />
          </div>
        </div>
      </div>

      <DataTable 
        :columns="tableColumns" 
        :data="paginatedLogs" 
        :sort-key="sortKey"
        :sort-order="sortOrder"
        empty-text="No activity logs recorded."
        @sort="handleSort" 
      >
        <template #cell(variant)="{ value }">
          <BaseBadge :variant="value">
            {{ value.toUpperCase() }}
          </BaseBadge>
        </template>
        <template #cell(title)="{ value }">
          <span class="fw-semibold text-dark">{{ value }}</span>
        </template>
        <template #cell(description)="{ value }">
          <span class="text-secondary small">{{ value }}</span>
        </template>
        <template #cell(timestamp)="{ value }">
          <span class="text-muted" style="font-size: 0.8rem;">{{ value }}</span>
        </template>
        <template #cell(actions)="{ row }">
          <BaseButton
            variant="outline-danger"
            size="sm"
            icon="bi bi-trash"
            title="Remove Log Entry"
            @click="deleteSingleLog(row.id)"
          />
        </template>
      </DataTable>

      <TablePagination
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        :totalItems="filteredLogs.length"
      />
    </div>

    <!-- Clear Logs Confirmation Modal -->
    <BaseModal
      :show="isClearModalOpen"
      title="Clear All Activity Logs"
      subtitle="This action will wipe the audit history permanently."
      @close="isClearModalOpen = false"
    >
      <p class="text-secondary">Are you sure you want to clear all recorded system activity logs?</p>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <BaseButton type="button" variant="secondary" size="sm" text="Cancel" @click="isClearModalOpen = false" />
        <BaseButton type="button" variant="danger" size="sm" text="Confirm Clear" @click="executeClearLogs" />
      </div>
    </BaseModal>
  </div>
</template>