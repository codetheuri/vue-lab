<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useProductStore } from '../stores/productStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useActivityStore } from '../stores/activityStore'
import { useDataTable } from '../composables/useDataTable'
import { usePermissions } from '../composables/usePermissions'
import { isRequired, isPositiveNumber, applyServerValidationErrors } from '../utils/validators'
import BaseInput from '../components/base/BaseInput.vue'
import BaseTextarea from '../components/base/BaseTextarea.vue'
import BaseSelect from '../components/base/BaseSelect.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import BaseBadge from '../components/base/BaseBadge.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue' 
import CsvImportModal from '../components/CsvImportModal.vue'
import { useToast } from '../composables/useToast'
import { useAuthStore } from '../stores/authStore'
import { useCsvExport } from '../composables/useCsvExport'
import { formatCurrency } from '../utils/formatters'

const { exportToCsv } = useCsvExport()
const authStore = useAuthStore()
const productStore = useProductStore()
const settingsStore = useSettingsStore()
const activityStore = useActivityStore()
const { canCreate, canEdit, canDelete, canReset } = usePermissions()

const { products, loading, error } = storeToRefs(productStore)
const { lowStockThreshold } = storeToRefs(settingsStore)
const { addProduct, updateProduct, deleteProduct, bulkDeleteProducts, resetProducts, fetchProducts } = productStore

// Reusable Table Composable (debounced search, sort, filters, pagination)
const {
  searchQuery,
  selectedCategoryOrDept: selectedCategory,
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
} = useDataTable(products)

const modalCategoryOptions = [
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Peripherals', label: 'Peripherals' },
  { value: 'Software', label: 'Software' },
  { value: 'Hardware', label: 'Hardware' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Accessories', label: 'Accessories' }
]

const { showSuccess, showDanger, showInfo } = useToast()

const exportToCSV = () => {
  if (!filteredProducts.value.length) {
    showDanger('No product records available to export.')
    return
  }

  const threshold = Number(lowStockThreshold.value) || 10
  const exportRows = filteredProducts.value.map(product => {
    const stock = Number(product.stock) || 0
    const liveStatus = stock === 0 ? 'Out of Stock' : stock < threshold ? 'Low Stock' : 'In Stock'
    return {
      ...product,
      status: liveStatus
    }
  })

  const headers = ['id', 'sku', 'name', 'category', 'price', 'stock', 'status', 'description']
  const success = exportToCsv(exportRows, headers, 'products.csv')
  if (success) {
    showSuccess('Products exported to CSV successfully!')
  }
}

// CSV Import Modal State & Batch Handler
const isImportModalOpen = ref(false)

const handleBatchImportProducts = async (rows) => {
  let count = 0
  for (const row of rows) {
    const priceVal = Number(row.price) || 0
    const stockVal = Number(row.stock) || 0
    const threshold = Number(lowStockThreshold.value) || 10
    const statusVal = stockVal === 0 ? 'Out of Stock' : stockVal < threshold ? 'Low Stock' : 'In Stock'

    const payload = {
      sku: row.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: row.name || 'Unnamed Product',
      category: row.category || 'General',
      price: priceVal,
      stock: stockVal,
      status: statusVal,
      description: row.description || ''
    }
    await addProduct(payload)
    count++
  }

  activityStore.logAction('Batch Import Products', `Imported ${count} product records via CSV upload.`, 'success')
  showSuccess(`Successfully imported ${count} product record(s)!`)
  isImportModalOpen.value = false
}

// Row selection & bulk deletion state
const selectedIds = ref([])
const isBulkDeleteModalOpen = ref(false)

const openBulkDeleteModal = () => {
  if (selectedIds.value.length > 0) {
    isBulkDeleteModalOpen.value = true
  }
}

const executeBulkDelete = async () => {
  if (!selectedIds.value.length) return
  const count = selectedIds.value.length
  await bulkDeleteProducts(selectedIds.value)
  showDanger(`Deleted ${count} product record(s).`)
  selectedIds.value = []
  isBulkDeleteModalOpen.value = false

  const totalPages = Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) currentPage.value = totalPages
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'In Stock', label: 'In Stock' },
  { value: 'Low Stock', label: 'Low Stock' },
  { value: 'Out of Stock', label: 'Out of Stock' }
]

const handleReset = async () => {
  await resetProducts()
  selectedIds.value = []
  showInfo('Catalog restored to default mock data.')
}

const computedStatus = computed(() => {
  const qty = Number(productForm.value.stock)
  const threshold = Number(lowStockThreshold.value) || 10
  if (qty === 0) return 'Out of Stock'
  if (qty < threshold) return 'Low Stock'
  return 'In Stock'
})

const errors = ref({ sku: '', name: '', price: '', stock: '', category: '', description: '' })

const clearErrors = () => {
  errors.value = { sku: '', name: '', price: '', stock: '', category: '', description: '' }
}

const saveProduct = async () => {
  errors.value.name = isRequired(productForm.value.name, 'Product Name required')
  errors.value.price = isPositiveNumber(productForm.value.price, {
    allowZero: false,
    message: 'Price must be greater than 0'
  })
  errors.value.stock = isPositiveNumber(productForm.value.stock, {
    allowZero: true,
    message: 'Stock must be 0 or more'
  })
  errors.value.category = isRequired(productForm.value.category, 'Category required')

  if (Object.values(errors.value).some(err => err !== '')) return

  const priceVal = Number(productForm.value.price)
  const stockVal = Number(productForm.value.stock)

  const payload = {
    ...productForm.value,
    sku: String(productForm.value.sku || '').trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    price: priceVal,
    stock: stockVal,
    status: computedStatus.value
  }

  try {
    if (editingProductId.value !== null) {
      await updateProduct(editingProductId.value, payload)
      showInfo('Product updated successfully.')
    } else {
      await addProduct(payload)
      showSuccess('Product added successfully!')
    }
    closeModal()
  } catch (err) {
    if (applyServerValidationErrors(err, errors)) return
    if (err.status !== 401 && err.status !== 403) {
      showDanger(err.message || 'Failed to save product record.')
    }
  }
}

const isDeleteModalOpen = ref(false)
const itemToDelete = ref(null)

const confirmDeletePrompt = (item) => {
  itemToDelete.value = item
  isDeleteModalOpen.value = true
}

const executeDelete = async () => {
  if (!itemToDelete.value) return
  await deleteProduct(itemToDelete.value.id)
  selectedIds.value = selectedIds.value.filter(id => id !== itemToDelete.value.id)
  showDanger('Product removed from catalog.')
  isDeleteModalOpen.value = false
  itemToDelete.value = null

  const totalPages = Math.ceil(filteredProducts.value.length / itemsPerPage.value) || 1
  if (currentPage.value > totalPages) currentPage.value = totalPages
}

const isViewModalOpen = ref(false)
const selectedProduct = ref(null)

const openViewModal = (product) => {
  selectedProduct.value = product
  isViewModalOpen.value = true
}

const transitionToEdit = () => {
  const prod = selectedProduct.value
  isViewModalOpen.value = false
  if (prod) openEditModal(prod)
}

const editingProductId = ref(null)
const productForm = ref({ sku: '', name: '', price: '', category: '', stock: 0, description: '' })

const resetProductForm = () => {
  productForm.value = { sku: '', name: '', price: '', category: '', stock: 0, description: '' }
  clearErrors()
}

watch(productForm, (newVal) => {
  if (newVal.sku && errors.value.sku) errors.value.sku = ''
  if (newVal.name && errors.value.name) errors.value.name = ''
  if (newVal.price !== '' && errors.value.price) errors.value.price = ''
  if (newVal.stock !== '' && errors.value.stock) errors.value.stock = ''
  if (newVal.category && errors.value.category) errors.value.category = ''
}, { deep: true })

const isModalOpen = ref(false)

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

const openEditModal = (product) => {
  editingProductId.value = product.id
  productForm.value = {
    sku: product.sku || '',
    name: product.name || '',
    price: product.price || '',
    category: product.category || '',
    stock: product.stock ?? 0,
    description: product.description || ''
  }
  clearErrors()
  isModalOpen.value = true
}

const modalTitle = computed(() => editingProductId.value ? 'Edit Inventory Item' : 'Register New Inventory Item')
const modalSubtitle = computed(() => editingProductId.value ? 'Modify the product details below.' : 'Fill in the details below to add a product to the catalog.')
const saveButtonText = computed(() => editingProductId.value ? 'Update Product' : 'Save Product')

watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingProductId.value = null
    clearErrors()
  }
})

const categoryOptions = computed(() => {
  const uniqueCategories = [...new Set(products.value.map(p => p.category).filter(Boolean))]
  return [
    { value: '', label: 'All Categories' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ]
})

const filteredProducts = computed(() => {
  return filterAndSortItems(['name', 'sku', 'category', 'description'])
})

const paginatedProducts = computed(() => {
  return paginate(filteredProducts.value)
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
        <!-- Bulk Delete Button -->
        <BaseButton
          v-if="canDelete && selectedIds.length > 0"
          variant="danger"
          size="md"
          :text="`Delete Selected (${selectedIds.length})`"
          icon="bi bi-trash-fill"
          @click="openBulkDeleteModal"
        />

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
          v-if="canCreate"
          variant="outline-secondary"
          size="md"
          text="Import CSV"
          icon="bi bi-upload"
          @click="isImportModalOpen = true"
        />
        <BaseButton
          v-if="canReset"
          variant="outline-danger"
          size="md"
          text="Reset Data"
          icon="bi bi-arrow-counterclockwise"
          :loading="loading"
          @click="handleReset"
        />
        <BaseButton
          v-if="canCreate"
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
        :selectable="canDelete"
        :loading="loading"
        :error="error"
        v-model:selectedIds="selectedIds"
        empty-text="No matching products found."
        @sort="handleSort"
        @retry="fetchProducts"
      >
        <template #cell(price)="{ value }">
          <span class="fw-semibold text-dark">{{ formatCurrency(value) }}</span>
        </template>

        <template #cell(status)="{ row }">
          <BaseBadge
            :variant="row.stock === 0 ? 'danger' : row.stock < lowStockThreshold ? 'warning' : 'success'"
          >
            {{ row.stock === 0 ? 'Out of Stock' : row.stock < lowStockThreshold ? 'Low Stock' : 'In Stock' }}
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
              v-if="canEdit"
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              title="Edit Product"
              @click="openEditModal(row)"
            />
            <BaseButton
              v-if="canDelete"
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

    <!-- CSV Import Modal Component -->
    <CsvImportModal
      :show="isImportModalOpen"
      title="Import Products CSV"
      :required-fields="['name', 'price']"
      @close="isImportModalOpen = false"
      @import="handleBatchImportProducts"
    />

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
        <div>
          <span class="text-secondary small d-block">Description</span>
          <p class="text-dark bg-light p-2 rounded small mb-0">{{ selectedProduct.description || 'No description provided.' }}</p>
        </div>
        <div class="row">
          <div class="col-6">
            <span class="text-secondary small d-block">Unit Price</span>
            <span class="text-dark fw-medium">{{ formatCurrency(selectedProduct.price) }}</span>
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
              :variant="selectedProduct.stock === 0 ? 'danger' : selectedProduct.stock < lowStockThreshold ? 'warning' : 'success'"
            >
              {{ selectedProduct.stock === 0 ? 'Out of Stock' : selectedProduct.stock < lowStockThreshold ? 'Low Stock' : 'In Stock' }}
            </BaseBadge>
          </div>
          <div class="col-6">
            <span class="text-secondary small d-block">Total Asset Valuation</span>
            <span class="text-dark fw-bold text-success">{{ formatCurrency(Number(selectedProduct.price) * Number(selectedProduct.stock)) }}</span>
          </div>
        </div>

        <div class="d-flex justify-content-end gap-2 mt-4">
          <BaseButton
            v-if="canEdit"
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
      v-if="canCreate || canEdit"
      :show="isModalOpen"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      @close="closeModal"
    >
      <form @submit.prevent="saveProduct">
        <div class="row">
          <div class="col-6">
            <BaseInput
              label="SKU"
              v-model="productForm.sku"
              placeholder="e.g. LPT-001 (auto if blank)"
              :error="errors.sku"
            />
          </div>
          <div class="col-6">
            <BaseInput
              label="Product Name"
              v-model="productForm.name"
              placeholder="e.g. Wireless Mouse"
              :error="errors.name"
            />
          </div>
        </div>

        <BaseSelect
          label="Category"
          v-model="productForm.category"
          :options="modalCategoryOptions"
          placeholder="Select category..."
          :error="errors.category"
        />

        <div class="row">
          <div class="col-6">
            <BaseInput
              label="Price"
              type="number"
              v-model="productForm.price"
              placeholder="0.00"
              :error="errors.price"
            />
          </div>
          <div class="col-6">
            <BaseInput
              label="Stock Level"
              type="number"
              v-model.number="productForm.stock"
              placeholder="0"
              :error="errors.stock"
            />
          </div>
        </div>

        <BaseTextarea
          label="Product Description"
          v-model="productForm.description"
          placeholder="Enter detailed product specifications or description..."
          :rows="3"
          :error="errors.description"
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
            :loading="loading"
          />
        </div>
      </form>
    </BaseModal>

    <!-- Single Delete Confirmation Modal -->
    <BaseModal
      v-if="canDelete"
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

    <!-- Bulk Delete Confirmation Modal -->
    <BaseModal
      v-if="canDelete"
      :show="isBulkDeleteModalOpen"
      title="Confirm Bulk Deletion"
      subtitle="This action cannot be undone."
      @close="isBulkDeleteModalOpen = false"
    >
      <p class="text-secondary">
        Are you sure you want to delete <strong>{{ selectedIds.length }}</strong> selected record(s)?
      </p>
      <div class="d-flex justify-content-end gap-2 mt-4">
        <BaseButton type="button" variant="secondary" size="sm" text="Cancel" @click="isBulkDeleteModalOpen = false" />
        <BaseButton type="button" variant="danger" size="sm" text="Confirm Delete" @click="executeBulkDelete" />
      </div>
    </BaseModal>
  </div>
</template>