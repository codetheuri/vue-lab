<script setup>
import { ref, computed, watch } from 'vue'
import { useProducts } from '../composables/useProducts.js' 
import BaseInput from '../components/base/BaseInput.vue'
import BaseModal from '../components/base/BaseModal.vue'
import BaseButton from '../components/base/BaseButton.vue'
import DataTable from '../components/table/DataTable.vue'
import TableSearch from '../components/table/TableSearch.vue'
import TablePagination from '../components/table/TablePagination.vue'
import TableFilters from '../components/table/TableFilters.vue' 

const { products, addProduct, updateProduct, deleteProduct } = useProducts()

const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(5)
const isModalOpen = ref(false)

// Track which product is currently being edited (null = Adding new)
const editingProductId = ref(null)

const productForm = ref({
  name: '',
  price: '',
  category: ''
})

const resetProductForm = () => {
  productForm.value = {
    name: '',
    price: '',
    category: ''
  }
}

const saveProduct = () => {
  if (editingProductId.value !== null) {
    updateProduct(editingProductId.value, { ...productForm.value })
  } else {
    addProduct({ ...productForm.value })
  }
  closeModal()
}

const closeModal = () => {
  isModalOpen.value = false
  editingProductId.value = null
  resetProductForm()
}

// Open modal for adding
const openAddModal = () => {
  editingProductId.value = null
  resetProductForm()
  isModalOpen.value = true
}

// Open modal for editing with pre-filled product data
const openEditModal = (product) => {
  editingProductId.value = product.id
  productForm.value = {
    name: product.name || '',
    price: product.price || '',
    category: product.category || ''
  }
  isModalOpen.value = true
}

const isFormValid = computed(() => {
  return productForm.value.name.trim() !== '' && Number(productForm.value.price) > 0
})



// Computed modal header titles dynamically updated based on state
const modalTitle = computed(() => editingProductId.value ? 'Edit Inventory Item' : 'Register New Inventory Item')
const modalSubtitle = computed(() => editingProductId.value ? 'Modify the product details below.' : 'Fill in the details below to add a product to the catalog.')
const saveButtonText = computed(() => editingProductId.value ? 'Update Product' : 'Save Product')

// Watch modal state changes to handle cleanup reactively
watch(isModalOpen, (isOpen) => {
  if (!isOpen) {
    editingProductId.value = null
  }
})

// Reset to page 1 whenever search query or category filter changes
watch([searchQuery, selectedCategory], () => {
  currentPage.value = 1
})

// Generate dynamic category options for TableFilters
const categoryOptions = computed(() => {
  const uniqueCategories = [...new Set(products.value.map(p => p.category).filter(Boolean))]
  return [
    { value: '', label: 'All Categories' },
    ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
  ]
})

// Filtered products list
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const query = searchQuery.value.toLowerCase().trim()
    const matchesSearch = !query || 
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)

    const matchesCategory = !selectedCategory.value || product.category === selectedCategory.value

    return matchesSearch && matchesCategory
  })
})

// Paginated subset
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const tableColumns = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Unit Price' },
  { key: 'stock', label: 'Stock Level' },
  { key: 'status', label: 'Availability' },
  { key: 'actions', label: 'Actions' }
]
</script>

<template>
  <div class="products-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 fw-bold text-dark mb-1">Products & Inventory</h1>
        <p class="text-secondary small mb-0">Track hardware, software licenses, and equipment allocations.</p>
      </div>

      <BaseButton
        variant="primary"
        size="md"
        text="Add Product"
        icon="bi bi-plus-circle-fill"
        @click="openAddModal"
      />
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

          <div style="max-width: 250px; width: 100%;">
            <TableSearch
              v-model="searchQuery"
              placeholder="Search products..."
              clearable
            />
          </div>
        </div>
      </div>

      <DataTable :columns="tableColumns" :data="paginatedProducts" empty-text="No matching products found.">
        <template #cell(price)="{ value }">
          <span class="fw-semibold text-dark">${{ Number(value).toFixed(2) }}</span>
        </template>

        <template #cell(status)="{ value }">
          <span class="badge bg-success-subtle text-success border border-success-subtle">
            {{ value }}
          </span>
        </template>

        <template #cell(actions)="{ row }">
          <div class="d-flex gap-2">
            <BaseButton
              variant="outline-primary"
              size="sm"
              icon="bi bi-pencil"
              @click="openEditModal(row)"
            />
            <BaseButton
              variant="outline-danger"
              size="sm"
              icon="bi bi-trash"
              @click="deleteProduct(row.id)"
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

    <!-- Modal -->
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
        />

        <BaseInput
          label="Price"
          type="number"
          v-model="productForm.price"
          placeholder="0.00"
        />

        <BaseInput
          label="Category"
          v-model="productForm.category"
          placeholder="e.g. Electronics"
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
            :disabled="!isFormValid"
          />
        </div>
      </form>
    </BaseModal>
  </div>
</template>