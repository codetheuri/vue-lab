<script setup>
/**
- DataTable.vue
- 
- Reusable data table component with support for dynamic columns,
- custom slot templates, empty states, and interactive column sorting.
 */
defineProps({
  columns: {
    type: Array,
    required: true,
    // Expected format: { key: 'name', label: 'Employee', sortable: true/false }
  },
  data: {
    type: Array,
    required: true
  },
  emptyText: {
    type: String,
    default: 'No records found.'
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc' // 'asc' or 'desc'
  }
})

const emit = defineEmits(['sort'])

const handleHeaderClick = (col) => {
  if (!col.sortable) return
  emit('sort', col.key)
}

// Get the correct sort icon based on current state
const getSortIcon = (col, currentSortKey, currentSortOrder) => {
  if (!col.sortable) return ''
  if (currentSortKey !== col.key) {
    return 'bi bi-arrow-down-up text-muted opacity-50' // Neutral state
  }
  return currentSortOrder === 'asc' 
    ? 'bi bi-sort-alpha-down text-primary' // Ascending
    : 'bi bi-sort-alpha-up text-primary'   // Descending
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              col.sortable ? 'user-select-none' : '',
              col.key === 'actions' ? 'text-end pe-4' : (col.key === 'sku' || col.key === 'name' ? 'ps-4' : '')
            ]"
            :style="col.sortable ? { cursor: 'pointer' } : {}"
            @click="handleHeaderClick(col)"
          >
            <div class="d-flex align-items-center gap-1" :class="col.key === 'actions' ? 'justify-content-end' : ''">
              <span>{{ col.label }}</span>
              <i v-if="col.sortable" :class="getSortIcon(col, sortKey, sortOrder)" style="font-size: 0.85rem;"></i>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="data && data.length > 0">
          <tr v-for="(row, rowIndex) in data" :key="row.id || rowIndex">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="[
                col.key === 'actions' ? 'text-end pe-4' : '',
                col.key === 'sku' || col.key === 'name' ? 'ps-4' : ''
              ]"
            >
              <slot :name="`cell(${col.key})`" :value="row[col.key]" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td :colspan="columns.length" class="text-center py-4 text-secondary">
              {{ emptyText }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>