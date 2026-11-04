<script setup>
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
  },
  itemsPerPageOptions: {
    type: Array,
    default: () => [5, 10, 25, 50]
  },
  showPerPageSelector: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:currentPage', 'update:itemsPerPage'])

const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage) || 1
})

const setPage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('update:currentPage', page)
  }
}

const handlePerPageChange = (event) => {
  const newSize = Number(event.target.value)
  emit('update:itemsPerPage', newSize)
  emit('update:currentPage', 1)
}
</script>

<template>
  <div class="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 p-3 border-top bg-white">
    <!-- Entry Count (Showing 1-5 format) & Per Page Selector (Showing just option numbers) -->
    <div class="d-flex align-items-center gap-3">
      <div class="small text-secondary">
        Showing
        <span class="fw-semibold text-dark">
          {{ totalItems === 0 ? 0 : `${Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-${Math.min(currentPage * itemsPerPage, totalItems)}` }}
        </span>
        of
        <span class="fw-semibold text-dark">{{ totalItems }}</span>
        entries
      </div>

      <div v-if="showPerPageSelector" class="d-flex align-items-center gap-2">
        <select
          class="form-select form-select-sm text-secondary"
          style="width: auto;"
          :value="itemsPerPage"
          aria-label="Items per page"
          @change="handlePerPageChange"
        >
          <option v-for="option in itemsPerPageOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div>

    <!-- Pagination Controls -->
    <nav aria-label="Table navigation">
      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 || totalPages === 0 }">
          <button
            class="page-link"
            type="button"
            aria-label="Previous"
            :disabled="currentPage === 1 || totalPages === 0"
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
        <li class="page-item" :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
          <button
            class="page-link"
            type="button"
            aria-label="Next"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="setPage(currentPage + 1)"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>