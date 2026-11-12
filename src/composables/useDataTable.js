import { ref, computed, watch } from 'vue'

export function useDataTable(itemsRef, defaultItemsPerPage = 5) {
  const searchQuery = ref('')
  const debouncedSearchQuery = ref('')
  const selectedCategoryOrDept = ref('')
  const selectedStatus = ref('')
  const currentPage = ref(1)
  const itemsPerPage = ref(defaultItemsPerPage)

  const sortKey = ref('')
  const sortOrder = ref('asc')

  // Debounce search query (300ms delay)
  let searchTimeout = null
  watch(searchQuery, (newVal) => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      debouncedSearchQuery.value = newVal
      currentPage.value = 1
    }, 300)
  })

  // Reset pagination when filters change
  watch([selectedCategoryOrDept, selectedStatus], () => {
    currentPage.value = 1
  })

  const handleSort = (key) => {
    if (sortKey.value === key) {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortKey.value = key
      sortOrder.value = 'asc'
    }
  }

  const clearAllFilters = () => {
    searchQuery.value = ''
    debouncedSearchQuery.value = ''
    selectedCategoryOrDept.value = ''
    selectedStatus.value = ''
    sortKey.value = ''
    sortOrder.value = 'asc'
    currentPage.value = 1
  }

  const hasActiveFilters = computed(() => {
    return searchQuery.value.trim() !== '' || 
           selectedCategoryOrDept.value !== '' || 
           selectedStatus.value !== '' || 
           sortKey.value !== ''
  })

  const filterAndSortItems = (searchFields = []) => {
    let result = itemsRef.value.filter(item => {
      const query = debouncedSearchQuery.value.toLowerCase().trim()
      
      const matchesSearch = !query || searchFields.some(field => {
        const val = item[field]
        return val && String(val).toLowerCase().includes(query)
      })

     const matchesSecondary = !selectedCategoryOrDept.value || 
        item.department === selectedCategoryOrDept.value || 
        item.category === selectedCategoryOrDept.value ||
        item.variant === selectedCategoryOrDept.value
      const matchesStatus = !selectedStatus.value || item.status === selectedStatus.value

      return matchesSearch && matchesSecondary && matchesStatus
    })

    if (sortKey.value) {
      result.sort((a, b) => {
        let valA = a[sortKey.value] ?? ''
        let valB = b[sortKey.value] ?? ''

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase()
          valB = valB.toLowerCase()
          if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1
          if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1
          return 0
        }

        return sortOrder.value === 'asc' ? valA - valB : valB - valA
      })
    }

    return result
  }

  const paginate = (filteredList) => {
    const totalPages = Math.ceil(filteredList.length / itemsPerPage.value) || 1
    if (currentPage.value > totalPages) {
      currentPage.value = totalPages
    }
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredList.slice(start, end)
  }

  return {
    searchQuery,
    selectedCategoryOrDept,
    selectedStatus,
    currentPage,
    itemsPerPage,
    sortKey,
    sortOrder,
    hasActiveFilters,
    handleSort,
    clearAllFilters,
    filterAndSortItems,
    paginate
  }
}