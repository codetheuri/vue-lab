<script setup>
/**
 * DataTable.vue
 * 
 * Generic reusable data table component.
 * Configured via `columns` and `data` props with dynamic slot cell rendering.
 * To be expanded with sorting, search, filtering, and pagination in the next phase.
 */
defineProps({
  columns: {
    type: Array,
    required: true,
    default: () => []
    // Example: [{ key: 'name', label: 'Name' }, ...]
  },
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyText: {
    type: String,
    default: 'No records found.'
  }
})
</script>

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle mb-0">
      <thead class="table-light">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :class="col.headerClass || ''"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="text-center py-5 text-secondary">
            <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
            Loading data...
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length" class="text-center py-5 text-secondary">
            {{ emptyText }}
          </td>
        </tr>
        <tr v-else v-for="(row, index) in data" :key="row.id || index">
          <td
            v-for="col in columns"
            :key="col.key"
            :class="col.cellClass || ''"
          >
            <!-- Slot for cell customization: e.g. #cell(status)="{ value, row }" -->
            <slot :name="`cell(${col.key})`" :value="row[col.key]" :row="row">
              {{ row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

