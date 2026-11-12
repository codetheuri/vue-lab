<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true // Array of { key: 'name', label: 'Name', sortable: true, class: '' }
  },
  data: {
    type: Array,
    required: true
  },
  sortKey: {
    type: String,
    default: ''
  },
  sortOrder: {
    type: String,
    default: 'asc' // 'asc' or 'desc'
  },
  emptyText: {
    type: String,
    default: 'No records found.'
  },
  selectable: {
    type: Boolean,
    default: false
  },
  selectedIds: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['sort', 'update:selectedIds'])

const isAllSelected = computed(() => {
  if (!props.data.length) return false
  return props.data.every(row => props.selectedIds.includes(row.id))
})

const toggleSelectAll = (e) => {
  if (e.target.checked) {
    const allIds = props.data.map(row => row.id)
    const merged = [...new Set([...props.selectedIds, ...allIds])]
    emit('update:selectedIds', merged)
  } else {
    const currentIds = new Set(props.data.map(row => row.id))
    const filtered = props.selectedIds.filter(id => !currentIds.has(id))
    emit('update:selectedIds', filtered)
  }
}

const toggleRow = (id) => {
  const list = [...props.selectedIds]
  const index = list.indexOf(id)
  if (index > -1) {
    list.splice(index, 1)
  } else {
    list.push(id)
  }
  emit('update:selectedIds', list)
}
</script>

<template>
  <div class="table-responsive position-relative mb-0">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light text-secondary text-uppercase fs-7" style="font-size: 0.75rem; letter-spacing: 0.05em;">
        <tr>
          <th v-if="selectable" style="width: 40px;" class="ps-3">
            <input
              type="checkbox"
              class="form-check-input"
              :checked="isAllSelected"
              @change="toggleSelectAll"
              aria-label="Select all visible rows"
            />
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[col.class, col.sortable ? 'cursor-pointer user-select-none' : '']"
            @click="col.sortable ? $emit('sort', col.key) : null"
          >
            <div class="d-flex align-items-center gap-1">
              <span>{{ col.label }}</span>
              <span v-if="col.sortable" class="text-muted" style="font-size: 0.7rem;">
                <template v-if="sortKey === col.key">
                  <i :class="sortOrder === 'asc' ? 'bi bi-chevron-up text-primary' : 'bi bi-chevron-down text-primary'"></i>
                </template>
                <template v-else>
                  <i class="bi bi-chevron-expand opacity-50"></i>
                </template>
              </span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading State Row -->
        <tr v-if="loading">
          <td :colspan="selectable ? columns.length + 1 : columns.length" class="text-center py-5">
            <div class="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
            <span class="text-muted small">Loading records...</span>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-else-if="data.length === 0">
          <td :colspan="selectable ? columns.length + 1 : columns.length" class="text-center py-4 text-muted small">
            {{ emptyText }}
          </td>
        </tr>

        <!-- Data Rows -->
        <template v-else>
          <tr v-for="row in data" :key="row.id" :class="{ 'table-active': selectedIds.includes(row.id) }">
            <td v-if="selectable" class="ps-3">
              <input
                type="checkbox"
                class="form-check-input"
                :checked="selectedIds.includes(row.id)"
                @change="toggleRow(row.id)"
                :aria-label="`Select row ${row.id}`"
              />
            </td>
            <td v-for="col in columns" :key="col.key" :class="col.class">
              <slot :name="`cell(${col.key})`" :row="row" :value="row[col.key]">
                {{ row[col.key] ?? 'N/A' }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
.cursor-pointer:hover {
  color: var(--bs-primary) !important;
}
</style>