<script setup>
import { ref, computed, watch } from 'vue'
import { useProducts } from '../composables/useProducts.js' 
import BaseInput from '../components/base/BaseInput.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue' 
import { useToast } from '../composables/useToast'

// 1. Toast & Composable setup
const { showSuccess, showDanger, showInfo } = useToast()
const { products, addProduct, updateProduct, deleteProduct, resetProducts } = useProducts()

// Filtering & Pagination State
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Sorting State
const sortKey = ref('')
const sortOrder = ref('asc')

const handleSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'asc'
  }
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Low Stock', label: 'Low Stock' },
  { value: 'Out of Stock', label: 'Out of Stock' }
]

const modalCategoryOptions = [
  'Electronics',
  'Peripherals',
  'Accessories',
  'Monitors',
  'Audio',
  'Furniture'
]

const hasActiveFilters = computed(() => {
  return searchQuery.value.trim() !== '' || 
         selectedCategory.value !== '' || 
         selectedStatus.value !== '' || 
         sortKey.value !== ''
})

const handleReset = () => {
  resetProducts()
  showInfo('Catalog restored to default mock data.')
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = ''
  selectedStatus.value = ''
  sortKey.value = ''
  sortOrder.value = 'asc'
}

// Export CSV Functionality
const exportToCSV = () => {
  if (!filteredProducts.value.length) {
    showDanger('No product records available to export.')
    return
  }
  const headers = ['id', 'sku', 'name', 'category', 'price', 'stock', 'status']
  const csvRows = [
    headers.join(','),
    ...filteredProducts.value.map(row => 
      headers.map(field => JSON.stringify(row[field] ?? '')).join(',')
    )
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', 'products.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
  showSuccess('Products exported to CSV successfully!')
}

// Auto-compute availability status based on stock qty
const computedStatus = computed(() => {
  const qty = Number(productForm.value.stock)
  if (qty === 0) return 'Out of Stock'
  if (qty < 10) return 'Low Stock'
  return 'In Stock'
})

// Field-specific validation errors state
const errors = ref({
  name: '',
  price: '',
  stock: '',
  category: ''
})

const clearErrors = () => {
  errors.value = { name: '', price: '', stock: '', category: '' }
}

const saveProduct = () => {
  errors.value.name = !productForm.value.name || String(productForm.value.name).trim() === '' ? 'Product Name required' : ''
  
  const priceVal = Number(productForm.value.price)
  if (productForm.value.price === '' || productForm.value.price === null || isNaN(priceVal)) {
    errors.value.price = 'Price required'
  } else if (priceVal <= 0) {
    errors.value.price = 'Price must be greater than 0'
  } else {
    errors.value.price = ''
  }

  const stockVal = Number(productForm.value.stock)
  if (productForm.value.stock === '' || productForm.value.stock === null || isNaN(stockVal)) {
    errors.value.stock = 'Stock Level required'
  } else if (stockVal < 0) {
    errors.value.stock = 'Stock must be 0 or more'
  } else {
    errors.value.stock = ''
  }

  errors.value.category = !productForm.value.category || String(productForm.value.category).trim() === '' ? 'Category required' : ''

  if (Object.values(errors.value).some(err => err !== '')) {
    return
  }

  const payload = {
    ...productForm.value,
    price: priceVal,
    stock: stockVal,
    status: computedStatus.value
  }

  if (editingProductId.value !== null) {
    updateProduct(editingProductId.value, payload)
    showInfo('Product updated successfully.')
  } else {
    addProduct(payload)
    showSuccess('Product added successfully!')
  }
  closeModal()
}

// Delete confirmation modal state
const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const confirmDeletePrompt = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const executeDelete = () => {
  if (!itemToDelete.value) return
  deleteProduct(itemToDelete.value.id)
  showDanger('Product removed from catalog.')
  isDeleteModalOpen.value = false
  itemToDelete.value = null

  const totalPages = Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) {
    currentPage.value = totalPages
  }
}

// Quick-View Modal State
const isViewModalOpen = ref(false)
const selectedProduct = ref(null)

const openViewModal = (product) => {
  selectedProduct.value = product
  isViewModalOpen.value = true
}

const transitionToEdit = () => {
  const prod = selectedProduct.value
  isViewModalOpen.value = false
  if (prod) {
    openEditModal(prod)
  }
}

// Track which product is currently being edited (null = Adding new)
const editingProductId = ref(null)

const productForm = ref({
  name: '',
  price: '',
  category: '',
  stock: 0
})

const resetProductForm = () => {
  productForm.value = {
    name: '',
    price: '',
    category: '',
    stock: 0
  }
  clearErrors()
}
// Clear individual field errors reactively as user types/selects
watch(productForm, (newVal) => {
  if (newVal.name && errors.value.name) errors.value.name = ''
  if (newVal.price !== '' && errors.value.price) errors.value.price = ''
  if (newVal.stock !== '' && errors.value.stock) errors.value.stock = ''
  if (newVal.category && errors.value.category) errors.value.category = ''
}, { deep: true })
const closeModal = () => {
  isModalOpen.value = false
  editingProductId.value = null
  resetProductForm()
}

const openAddModal = () => {
  editingProductId.value = null
  resetProductForm()
  isModalOpen.value = true
}
const isModalOpen = ref(false)
const openEditModal = (product) => {
  editingProductId.value = product.id
  productForm.value = {
    name: product.name || '',
    price: product.price || '',
    category: product.category || '',
    stock: product.stock ?? 0
  }
  clearErrors()
  isModalOpen.value = true
}

// Computed modal header titles dynamically updated based on state
const modalTitle = computed(() => editingProductId.value ? 'Edit Inventory Item' : 'Register New Inventory Item')
const modalSubtitle = computed(() => editingProductId.value ? 'Modify the product details below.' : 'Fill in the details below to add a product to the catalog.')
const saveButtonText = computed(() => editingProductId.value ? 'Update Product' : 'Save Product')

// Watch modal state changes to handle cleanup reactively
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingProductId.value = null
    clearErrors()
  }
})

watch([searchQuery, selectedCategory, selectedStatus], () => {
  currentPage.value = 1
})

const categoryOptions = computed(() => {
  const uniqueCategories = [...new Set(products.value.map(p => p.category).filter(Boolean))]
  return [
    { value: '', label: 'All Categories' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ]
})

const filteredProducts = computed(() => {
  let result = products.value.filter(product => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)

    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value
    const matchesStatus = !selectedStatus.value || product.status === selectedStatus.value

    return matchesSearch && matchesCategory && matchesStatus
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
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const tableColumns = [
  { key: 'sku', label: 'SKU', sortable: true, class: 'ps-4' },
  { key: 'name', label: 'Product Name', sortable: true },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'price', label: 'Unit Price', sortable: true },
  { key: 'stock', label: 'Stock Level', sortable: true },
  { key: 'status', label: 'Availability', sortable: true },
  { key: 'actions', label: 'Actions', sortable: false }
]
</script>

<template>
  <div class="products-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Products & Inventory</h1>
        <p class="text-secondary small mb-0">Track hardware, software licenses, and equipment allocations.</p>
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
          text="Reset Data"
          icon="bi bi-arrow-counterclockwise"
          @click="handleReset"
        />
        <BaseButton
          variant="primary"
          size="md"
          text="Add Product"
          icon="bi bi-plus-circle-fill"
          @click="openAddModal"
        />
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card shadow-sm border">
      <div class="card-header bg-white py-3 px-4 border-bottom d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
        <div class="d-flex align-items-center gap-2">
          <i class="bi bi-box-seam text-primary"></i>
          <span class="fw-semibold text-dark">Product Catalog Table</span>
          <span class="badge bg-primary-subtle text-primary border border-primary-subtle ms-2">
            {{ filteredProducts.length }} Records
          </span>
        </div>

        <div class="d-flex flex-wrap align-items-center gap-3">
          <TableFilters
            v-model="selectedCategory"
            label="Category"
            :options="categoryOptions"
          />

          <TableFilters
            v-model="selectedStatus"
            label="Availability"
            :options="statusOptions"
          />

          <div style="max-width: 250px; width: 100%;">
            <TableSearch
              v-model="searchQuery"
              placeholder="Search products..."
              clearable
            />
          </div>
        </div>
      </div>

      <DataTable 
        :columns="tableColumns" 
        :data="paginatedProducts" 
        :sort-key="sortKey"
        :sort-order="sortOrder"
        empty-text="No matching products found."
        @sort="handleSort"
      >
        <template #cell(price)="{ value }">
          <span class="fw-semibold text-dark">${{ Number(value).toFixed(2) }}</span>
        </template>

        <template #cell(status)="{ value }">
          <BaseBadge
            :variant="value === 'In Stock' ? 'success' : value === 'Low Stock' ? 'warning' : 'danger'"
          >
            {{ value }}
          </BaseBadge>
        </template>

        <template #cell(actions)="{ row }">
          <div class="d-flex gap-2">
            <BaseButton
              variant="outline-secondary"
              size="sm"
              icon="bi bi-eye"
              title="Quick View"
              @click="openViewModal(row)"
            />
            <BaseButton
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              title="Edit Product"
              @click="openEditModal(row)"
            />
            <BaseButton
              variant="outline-danger"
              size="sm"
              icon="bi bi-trash"
              title="Delete Product"
              @click="confirmDeletePrompt(row)"
            />
          </div>
        </template>
      </DataTable>

      <TablePagination
        v-model:currentPage="currentPage"
        v-model:itemsPerPage="itemsPerPage"
        :totalItems="filteredProducts.length"
      />
    </div>

    <!-- Quick View Product Modal -->
    <BaseModal
      :show="isViewModalOpen"
      title="Product Details"
      subtitle="Detailed view of inventory record."
      @close="isViewModalOpen = false"
    >
      <div v-if="selectedProduct" class="vstack gap-3">
        <div class="row">
          <div class="col-6">
            <span class="text-secondary small d-block">SKU</span>
            <span class="fw-semibold text-dark">{{ selectedProduct.sku }}</span>
          </div>
          <div class="col-6">
            <span class="text-secondary small d-block">Category</span>
            <span class="badge bg-light text-dark border">{{ selectedProduct.category }}</span>
          </div>
        </div>
        <div>
          <span class="text-secondary small d-block">Product Name</span>
          <span class="fw-semibold text-dark fs-6">{{ selectedProduct.name }}</span>
        </div>
        <div class="row">
          <div class="col-6">
            <span class="text-secondary small d-block">Unit Price</span>
            <span class="text-dark fw-medium">${{ Number(selectedProduct.price).toFixed(2) }}</span>
          </div>
          <div class="col-6">
            <span class="text-secondary small d-block">Stock Level</span>
            <span class="text-dark fw-medium">{{ selectedProduct.stock }} units</span>
          </div>
        </div>
        <div class="row">
          <div class="col-6">
            <span class="text-secondary small d-block">Availability Status</span>
            <BaseBadge
              :variant="selectedProduct.status === 'In Stock' ? 'success' : selectedProduct.status === 'Low Stock' ? 'warning' : 'danger'"
            >
              {{ selectedProduct.status }}
            </BaseBadge>
          </div>
          <div class="col-6">
            <span class="text-secondary small d-block">Total Asset Valuation</span>
            <span class="text-dark fw-bold text-success">${{ (Number(selectedProduct.price) * Number(selectedProduct.stock)).toFixed(2) }}</span>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            type="button"
            variant="outline-primary"
            size="sm"
            text="Edit"
            icon="bi bi-pencil"
            @click="transitionToEdit"
          />
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            text="Close"
            @click="isViewModalOpen = false"
          />
        </div>
      </div>
    </BaseModal>

    <!-- Add/Edit Modal -->
    <BaseModal
      :show="isModalOpen"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      @close="closeModal"
    >
      <form @submit.prevent="saveProduct">
        <BaseInput
          label="Product Name"
          v-model="productForm.name"
          placeholder="e.g. Wireless Mouse"
          :error="errors.name"
        />

        <BaseInput
          label="Price"
          type="number"
          v-model="productForm.price"
          placeholder="0.00"
          :error="errors.price"
        />

        <BaseInput
          label="Stock Level"
          type="number"
          v-model.number="productForm.stock"
          placeholder="0"
          :error="errors.stock"
        />

        <BaseSelect
          label="Category"
          v-model="productForm.category"
          :options="modalCategoryOptions"
          placeholder="Select category..."
          :error="errors.category"
        />

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            type="button"
            variant="secondary"
            size="sm"
            text="Cancel"
            @click="closeModal"
          />
          
          <BaseButton
            type="submit"
            variant="primary"
            size="sm"
            :text="saveButtonText"
          />
          
        </div>
      </form>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal
      :show="isDeleteModalOpen"
      title="Confirm Deletion"
      subtitle="This action cannot be undone."
      @close="isDeleteModalOpen = false"
    >
      <p class="text-secondary">Are you sure you want to delete <strong>{{ itemToDelete?.name }}</strong>?</p>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <BaseButton type="button" variant="secondary" size="sm" text="Cancel" @click="isDeleteModalOpen = false" />
        <BaseButton type="button" variant="danger" size="sm" text="Confirm Delete" @click="executeDelete" />
      </div>
    </BaseModal>
  </div>
</template>