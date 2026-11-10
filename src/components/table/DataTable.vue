<script setup>
/**
- DataTable.vue
- 
- Reusable data table component with support for dynamic columns,
- custom slot templates, empty states, interactive column sorting,
- and row selection checkboxes for bulk actions.
 */
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
    // Expected format: { key: 'name', label: 'Name', sortable: true, class: 'ps-4' }
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
  },
  selectable: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['sort', 'update:selectedIds'])

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

// Check if all visible rows are currently selected
const isAllSelected = computed(() => {
  if (!props.data || props.data.length === 0) return false
  return props.data.every(row => props.selectedIds.includes(row.id))
})

// Toggle select all on current visible page
const toggleSelectAll = (event) => {
  const isChecked = event.target.checked
  const currentPageIds = props.data.map(row => row.id)
  
  let newSelected = [...props.selectedIds]
  if (isChecked) {
    currentPageIds.forEach(id => {
      if (!newSelected.includes(id)) {
        newSelected.push(id)
      }
    })
  } else {
    newSelected = newSelected.filter(id => !currentPageIds.includes(id))
  }
  emit('update:selectedIds', newSelected)
}

// Toggle individual row selection
const toggleRowSelect = (id) => {
  const newSelected = [...props.selectedIds]
  const index = newSelected.indexOf(id)
  if (index === -1) {
    newSelected.push(id)
  } else {
    newSelected.splice(index, 1)
  }
  emit('update:selectedIds', newSelected)
}
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr>
          <!-- Checkbox Column Header -->
          <th v-if="selectable" scope="col" style="width: 40px;" class="ps-4 text-center">
            <input
              type="checkbox"
              class="form-check-input"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              aria-label="Select all rows"
            />
          </th>

          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              col.sortable ? 'user-select-none' : '',
              col.class || ''
            ]"
            :style="col.sortable ? { cursor: 'pointer' } : {}"
            @click="handleHeaderClick(col)"
          >
            <div 
              class="d-flex align-items-center gap-1" 
              :class="col.class?.includes('text-end') ? 'justify-content-end' : ''"
            >
              <span>{{ col.label }}</span>
              <i v-if="col.sortable" :class="getSortIcon(col, sortKey, sortOrder)" style="font-size: 0.85rem;"></i>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-if="data && data.length > 0">
          <tr v-for="(row, rowIndex) in data" :key="row.id || rowIndex">
            <!-- Individual Row Checkbox -->
            <td v-if="selectable" class="ps-4 text-center">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="selectedIds.includes(row.id)"
                @change="toggleRowSelect(row.id)"
                :aria-label="`Select row ${row.id}`"
              />
            </td>

            <td
              v-for="col in columns"
              :key="col.key"
              :class="col.class || ''"
            >
              <slot :name="`cell(${col.key})`" :value="row[col.key]" :row="row">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </template>
        <template v-else>
          <tr>
            <td :colspan="selectable ? columns.length + 1 : columns.length" class="text-center py-4 text-secondary">
              {{ emptyText }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>