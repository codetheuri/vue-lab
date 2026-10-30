<script setup>
/**
 * TablePagination.vue
 * 
 * Reusable pagination component for DataTable.
 * Calculates pages and emits page change events.
 */
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 5
  }
})

const emit = defineEmits(['update:currentPage'])

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage) || 1
})

const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}
</script>

<template>
  <div class="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-2 p-3 border-top bg-white">
    <div class="small text-secondary">
      Showing
      <span class="fw-semibold text-dark">{{ Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) }}</span>
      to
      <span class="fw-semibold text-dark">{{ Math.min(currentPage * itemsPerPage, totalItems) }}</span>
      of
      <span class="fw-semibold text-dark">{{ totalItems }}</span>
      entries
    </div>

    <nav aria-label="Table navigation">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            type="button"
            aria-label="Previous"
            :disabled="currentPage === 1"
            @click="setPage(currentPage - 1)"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button
            class="page-link"
            type="button"
            @click="setPage(page)"
          >
            {{ page }}
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            type="button"
            aria-label="Next"
            :disabled="currentPage === totalPages"
            @click="setPage(currentPage + 1)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

